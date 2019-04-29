
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const moment = require('moment');

const HotelModel = mongoose.model('hotel');
const router = express.Router();

const DATE_FORMAT = 'YYYY-MM-DD';

router.get('/hotel/list', (req, res) => {
  HotelModel.find({}, (error, hotels) => {
    if (error) {
      return res.status(500).send({ message: error });
    }
    return res.status(200).send(hotels);
  });
});

router.get('/hotel/find', (req, res) => {
  const conditions = {};
  if (req.body.name) {
    conditions.name = { $regex: req.body.name, $options: 'i' };
  }
  if (req.body.extra_features && req.body.extra_features.length > 0) {
    conditions.extra_features = { $all: req.body.extra_features };
  }
  if (req.body.room) {
    const { room } = req.body;
    if (room.number_of_beds) {
      conditions['rooms.number_of_beds'] = { $eq: room.number_of_beds };
    }
    if (room.extra_features && room.extra_features.length > 0) {
      conditions['rooms.extra_features'] = { $all: room.extra_features };
    }
  }
  const interval = req.body.interval || [new Date()];
  if (interval.length === 1) {
    interval.push(interval[0]);
  }

  HotelModel.find(conditions, (error, hotels) => {
    if (error) return res.status(500).send({ message: error });
    return res.status(200).send(hotels);
  });
});

router.put('/hotel/add', (req, res) => {
  const now = new Date();
  const reservations = new Array(366);
  reservations.fill({
    year: now.getFullYear(),
    guests: [],
    numberOfGuests: 0,
  });
  req.body.rooms.forEach((room) => { room.reservations = reservations; });

  const hotel = new HotelModel({
    name: req.body.name,
    stars: req.body.stars,
    extra_features: req.body.extra_features,
    rooms: req.body.rooms,
  });
  hotel.save((error) => {
    if (error) return res.status(500).send({ message: 'Error while adding new hotel to the database!' });
    return res.status(200).send({ message: 'Hotel added!' });
  });
});

router.post('/hotel/:id/room/add', (req, res) => {
  HotelModel.findOneAndUpdate({ _id: req.params.id }, { $push: { rooms: req.body } },
    (error) => {
      if (error) return res.status(500).send({ message: 'Error while adding room to the hotel!' });
      return res.status(200).send({ message: 'Room added!' });
    });
});

router.post('/hotel/:hotelId/room/:roomId/:begin/:end/reserve', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send({ message: 'You have to be logged in to make a reservation!' });
  }

  const beginDate = moment(req.params.begin, DATE_FORMAT);
  const endDate = moment(req.params.end, DATE_FORMAT);
  const today = moment();


  if (!beginDate.isValid()) {
    return res.status(400).send({ message: 'Invalid date fromat for the beginning of the reservation. YYYY-MM-DD' });
  }

  if (!beginDate.isValid()) {
    return res.status(400).send({ message: 'Invalid date fromat for the end of the reservation. YYYY-MM-DD' });
  }

  if (beginDate.isBefore(today)) {
    return res.status(400).send({ message: 'Cannot make reservation for a room starting in the past.' });
  }

  if (endDate.isBefore(today)) {
    return res.status(400).send({ message: 'Cannot make reservation for a room ends in the past.' });
  }

  if (endDate.isBefore(beginDate)) {
    return res.status(400).send({ message: 'The beginning of the reservation must be before the end!' });
  }

  if (!endDate.isAfter(today.clone().add(1, 'year'))) {
    return res.status(400).send({ message: 'Cannot make reservation for more then a year from today!' });
  }

  HotelModel.findById(req.params.hotelId, { 'rooms._id': 1, 'rooms.available': 1 }, (err, hotel) => {
    if (!hotel) {
      return res.status(404).send({ message: 'No such hotel!' });
    }
    if (!hotel.rooms.id(req.params.roomId)) {
      return res.status(404).send({ message: 'No such room!' });
    }

    const endDayOfYear = endDate.dayOfYear();

    let date = beginDate.clone();
    for (let i = beginDate.dayOfYear() - 1; i < endDayOfYear - 1; i += 1, date.add(1, 'days')) {
      const clearOldResConditions = { rooms: { $elemMatch: { _id: req.params.roomId } } };
      const clearOldResUpdate = { $set: {} };
      const isOldReservation = {};
      if (i < today.dayOfYear()) {
        isOldReservation[`reservations.${i}.year`] = { $lte: today.year() };
        clearOldResUpdate.$set[`rooms.$[room].reservations.${i}.year`] = today.year() + 1;
      } else {
        isOldReservation[`reservations.${i}.year`] = { $lt: today.year() };
        clearOldResUpdate.$set[`rooms.$[room].reservations.${i}.numberOfGuests`] = today.year();
      }
      clearOldResConditions.rooms.$elemMatch = isOldReservation;
      clearOldResUpdate.$set[`rooms.$[room].reservations.${i}.numberOfGuests`] = 0;
      clearOldResUpdate.$set[`rooms.$[room].reservations.${i}.guests`] = [];
      HotelModel.findOneAndUpdate(clearOldResConditions, clearOldResUpdate, { arrayFilters: [{ 'room._id': req.params.roomId }] },
        (err) => {
          if (err) return res.status(500).send({ message: err });
        });
    }

    date = beginDate.clone();
    const makeNewResConditions = { rooms: { $elemMatch: { _id: req.params.roomId } } };
    const makeNewResUpdates = { $push: {}, $inc: {} };
    for (let i = beginDate.dayOfYear() - 1; i < endDayOfYear - 1; i += 1, date.add(1, 'days')) {
      const isThereAvailableRoom = {};
      isThereAvailableRoom[`reservations.${i}.numberOfGuests`] = { $lt: hotel.rooms.id(req.params.roomId).available };
      makeNewResConditions.rooms.$elemMatch = isThereAvailableRoom;
      makeNewResUpdates.$inc[`rooms.$[room].reservations.${i}.numberOfGuests`] = 1;
      makeNewResUpdates.$push[`rooms.$[room].reservations.${i}.guests`] = req.session.passport.user._id;
    }
    HotelModel.findOneAndUpdate(makeNewResConditions, makeNewResUpdates, { arrayFilters: [{ 'room._id': req.params.roomId }] },
      (err, hotel) => {
        if (err) return res.status(500).send({ message: err });
        return res.status(200).send({ message: 'successful reservation!' });
      });
  });
});

module.exports = router;

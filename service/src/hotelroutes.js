
const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');

const HotelModel = mongoose.model('hotel');
const router = express.Router();

const DATE_FORMAT = 'YYYY-MM-DD';

function validateDateInterval(beginDate, endDate, today, res) {
  if (!beginDate.isValid()) {
    return res.status(400).send({ message: 'Invalid date fromat for the beginning of the reservation. YYYY-MM-DD', type: 'danger' });
  }

  if (!beginDate.isValid()) {
    return res.status(400).send({ message: 'Invalid date fromat for the end of the reservation. YYYY-MM-DD', type: 'danger' });
  }

  if (endDate.isBefore(beginDate)) {
    return res.status(400).send({ message: 'The beginning of the reservation must be before the end!', type: 'danger' });
  }

  if (beginDate.isBefore(today)) {
    return res.status(400).send({ message: 'Cannot make reservation for a room in the past.', type: 'danger' });
  }

  if (endDate.isAfter(today.clone().add(1, 'year'))) {
    return res.status(400).send({ message: 'Reservation date must be within one year!', type: 'danger' });
  }
  return null;
}

router.get('/hotel/list', (req, res) => {
  HotelModel.find({}, {
    _id: 1,
    stars: 1,
    name: 1,
    extra_features: 1,
    'rooms.number_of_beds': 1,
    'rooms.extra_features': 1,
  }, (error, hotels) => {
    if (error) {
      return res.status(500).send({ message: error });
    }
    return res.status(200).send(hotels);
  });
});

router.get('/hotel/find', (req, res) => {
  const conditions = {};
  if (!req.query.arrival || !req.query.leaving) {
    return res.status(403).send({ message: 'Arrival and leaving date must be given!', type: 'danger' });
  }
  const today = moment.utc({ hour: 0, minute: 0, second: 0 });
  const beginDate = moment.utc(req.query.arrival, DATE_FORMAT);
  const endDate = moment.utc(req.query.leaving, DATE_FORMAT);
  const fauilre = validateDateInterval(beginDate, endDate, today, res);
  if (fauilre) {
    return fauilre;
  }

  if (req.query.name) {
    conditions.name = { $regex: req.query.name, $options: 'i' };
  }
  if (req.query.extra_features && req.query.extra_features.length > 0) {
    conditions.extra_features = { $all: req.query.extra_features };
  }
  if (req.query.number_of_beds || req.query.romm_extra_features) {
    const roomConditions = {};
    if (req.query.number_of_beds) {
      roomConditions.number_of_beds = { $eq: req.query.number_of_beds };
    }
    if (req.query.extra_features && req.query.extra_features.length > 0) {
      roomConditions.extra_features = { $all: req.query.extra_features };
    }
    conditions.rooms.$elemMatch = roomConditions;
  }


  HotelModel.find(conditions, {
    _id: 1,
    stars: 1,
    name: 1,
    extra_features: 1,
    'rooms._id': 1,
    'rooms.number_of_beds': 1,
    'rooms.available': 1,
    'rooms.extra_features': 1,
    'rooms.reservations.year': 1,
    'rooms.reservations.numberOfGuests': 1,
  }, (error, hotels) => {
    if (error) return res.status(500).send({ message: error });
    return res.status(200).send(hotels.filter(hotel => !!hotel.rooms.filter((room) => {
      let oneEmptyRoomForInterval = true;
      for (let i = beginDate.dayOfYear() - 1; i < endDate.dayOfYear(); i += 1) {
        oneEmptyRoomForInterval = oneEmptyRoomForInterval && (room.reservations[i].year < today.year()
          || room.reservations[i].year >= today.year() && room.reservations[i].numberOfGuests < room.available);
      }
      return oneEmptyRoomForInterval;
    })).map((hotel) => {
      hotel.rooms.forEach((room) => {
        room.set('remaining', room.available - room.reservations.map(res => res.numberOfGuests).reduce((a, b) => (a > b ? a : b)), { strict: false });
        room.set('reservations', undefined);
        room.set('available', undefined);
      });
      return hotel;
    }));
  });
});

router.put('/hotel/add', (req, res) => {
  const now = moment.utc({ hour: 0, minute: 0, second: 0 });
  const reservations = new Array(366);
  const reservationInit = {
    year: now.year(),
    guests: [],
    numberOfGuests: 0,
  };
  reservations.fill(reservationInit, 0, now.dayOfYear());
  reservations.fill(reservationInit, now.dayOfYear(), 366);

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

  const beginDate = moment.utc(req.params.begin, DATE_FORMAT);
  const endDate = moment.utc(req.params.end, DATE_FORMAT);
  const today = moment.utc({ hour: 0, minute: 0, second: 0 });

  const fauilre = validateDateInterval(beginDate, endDate, today, res);
  if (fauilre) {
    return fauilre;
  }

  HotelModel.findById(req.params.hotelId, { 'rooms._id': 1, 'rooms.available': 1 }, (err, hotel) => {
    if (!hotel) {
      return res.status(404).send({ message: 'No such hotel!' });
    }
    if (!hotel.rooms.id(req.params.roomId)) {
      return res.status(404).send({ message: 'No such room!' });
    }

    let date = beginDate.clone();
    for (let i = beginDate.dayOfYear() - 1; i < endDate.dayOfYear(); i += 1, date.add(1, 'days')) {
      const clearOldResConditions = { rooms: { $elemMatch: { _id: req.params.roomId } } };
      const clearOldResUpdate = { $set: {} };
      const isOldReservation = {};
      if (i < today.dayOfYear() - 1) {
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
    for (let i = beginDate.dayOfYear() - 1; i < endDate.dayOfYear(); i += 1, date.add(1, 'days')) {
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

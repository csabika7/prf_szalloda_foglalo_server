
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const date = require('date-and-time');

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

  HotelModel.findById(req.params.hotelId,
    (findError, hotel) => {
      if (findError) return res.status(500).send({ message: 'Error during finding the hotel' });

      const roomToReserve = hotel.rooms.find(room => room._id.equals(req.params.roomId));
      if (!roomToReserve) return res.status(400).send({ message: 'There is no no such room' });

      if (!date.isValid(req.params.begin, DATE_FORMAT)) {
        return res.status(403).send({ message: 'Invalid date fromat for the beginning of the reservation. E.g.: 2018-01-05' });
      }

      if (!date.isValid(req.params.end, DATE_FORMAT)) {
        return res.status(403).send({ message: 'Invalid date fromat for the end of the reservation. E.g.: 2018-01-05' });
      }

      let beginDate = date.parse(req.params.begin, DATE_FORMAT);
      const endDate = date.parse(req.params.end, DATE_FORMAT);

      const datesForAllRoomsReserved = [];
      while (beginDate < endDate) {
        if (roomToReserve.reservations) {
          const beginDateText = date.format(beginDate, DATE_FORMAT);
          const guests = roomToReserve.reservations.get(beginDateText);
          if (guests && roomToReserve.available === guests.length) {
            datesForAllRoomsReserved.push(beginDateText);
          }
        }
        beginDate = date.addDays(beginDate, 1);
      }
      if (datesForAllRoomsReserved.length > 0) {
        return res.status(400).send({ message: `All rooms are reserved for dates: ${datesForAllRoomsReserved}` });
      }

      if (!roomToReserve.reservations) {
        roomToReserve.reservations = new Map();
      }
      beginDate = date.parse(req.params.begin, DATE_FORMAT);
      while (beginDate < endDate) {
        const beginDateText = date.format(beginDate, DATE_FORMAT);
        if (!roomToReserve.reservations.has(beginDateText)) {
          roomToReserve.reservations.set(beginDateText, []);
        }
        const guests = roomToReserve.reservations.get(beginDateText);
        guests.push(req.session.passport.user._id);
        beginDate = date.addDays(beginDate, 1);
      }
      roomToReserve.markModified('reservations');
      hotel.save((saveError) => {
        console.log(saveError);
        if (saveError) return res.status(500).send({ message: 'Error during reserving room for new guest.' });
        return res.status(200).send({ message: 'Reservation successful!' });
      });
    });
});

module.exports = router;

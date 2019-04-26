
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const HotelModel = mongoose.model('hotel');
const router = express.Router();


router.get('/hotel/list', (req, res) => {
  HotelModel.find({}, (err, hotels) => {
    if (err) {
      return res.status(500).send(err);
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
  console.log(conditions);
  HotelModel.find(conditions, (error, hotels) => {
    if (error) return res.status(500).send(error);
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
    if (error) return res.status(500).send({ message: 'db error' });
    return res.status(200).send({ message: 'hotel added' });
  });
});

router.post('/hotel/:id/room/add', (req, res) => {
  HotelModel.findOneAndUpdate({ _id: req.params.id }, { $push: { rooms: req.body } },
    (error) => {
      if (error) return res.status(500).send({ message: 'db error' });
      return res.status(200).send({ message: 'room added' });
    });
});

router.post('/hotel/:hotelId/room/:roomId/reserve', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send('You are not welcome here');
  }

  HotelModel.findById(req.params.hotelId,
    (findError, hotel) => {
      if (findError) return res.status(500).send({ message: 'error during finding the hotel' });
      const roomToReserve = hotel.rooms.find(room => room._id.equals(req.params.roomId));
      if (!roomToReserve) return res.status(400).send({ message: 'no such room' });
      if (roomToReserve.available === roomToReserve.guests.length) {
        return res.status(400).send({ message: 'all rooms are reserved' });
      }
      roomToReserve.guests.push(mongoose.Types.ObjectId(req.session.passport.user._id));
      hotel.save((saveError) => {
        if (saveError) return res.status(500).send({ message: 'error during reserving room for new guest' });
        return res.status(200).send({ message: 'reserved' });
      });
    });
});

module.exports = router;

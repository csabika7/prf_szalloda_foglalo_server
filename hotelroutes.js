
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

router.put('/hotel/add', (req, res) => {
  const hotel = new HotelModel({
    name: req.body.name,
    stars: req.body.stars,
    extra_features: req.body.extra_features,
    rooms: req.body.rooms,
  });
  hotel.save((error) => {
    console.log(error);
    if (error) return res.status(500).send({ message: 'db error' });
    return res.status(200).send({ message: 'hotel added' });
  });
});

router.post('/hotel/:id/room/add', (req, res) => {
  HotelModel.findOneAndUpdate({ _id: req.params.id }, { $push: { rooms: req.body.room } },
    (error) => {
      if (error) return res.status(500).send({ message: 'db error' });
      return res.status(200).send({ message: 'room added' });
    });
});

module.exports = router;

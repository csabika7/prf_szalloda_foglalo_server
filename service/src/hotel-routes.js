
const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const mailer = require('nodemailer');

const HotelModel = mongoose.model('hotel');
const RatingsModel = mongoose.model('rating');
const ReservationLogModel = mongoose.model('reservationlog');
const router = express.Router();

const DATE_FORMAT = 'YYYY-MM-DD';

function logReservation(userId, hotelId, hotelName, roomNumberOfBeds, arrival, leaving) {
  const log = new ReservationLogModel({
    hotelId,
    userId,
    hotelName,
    roomNumberOfBeds,
    arrival,
    leaving,
  });
  log.save((error) => {
    if (error) return console.log(`Failed to log reservation ${error}`);
  });
}

function sendEmail(userName, userEmail, numberOfBeds, arrival, leaving, hotel, cb) {
  const transporter = mailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Your reservation to ${hotel}`,
    text: `Hello ${userName}!
    Thank you for your reservation!.
    Reservation details:
    Hotel: ${hotel}
    Room: ${numberOfBeds} beds in the bedroom
    Arrival: ${arrival}
    Leaving: ${leaving}

    See you soon!
    `,
    html: `<h2>Thank you for your reservation!.</h2>
    <p>Reservation details:</p>
    <ul>
    <li> Hotel: ${hotel}</li>
    <li>Room: ${numberOfBeds} beds in the bedroom,</li>
    <li>Arrival: ${arrival}</li>
    <li>Leaving: ${leaving}</li>
    </ul>
    <p>See you soon</p>
    `,
  }, cb);
}

function computeUserRatings(hotelId) {
  return RatingsModel.aggregate([
    {
      $match: {
        hotelId: new mongoose.Types.ObjectId(hotelId),
      },
    }, {
      $group: {
        _id: null,
        ratings: { $avg: '$rating' },
      },
    }, {
      $project: {
        _id: 0,
        ratings: 1,
      },
    }]);
}

function validateDateInterval(beginDate, endDate, today, res) {
  if (!beginDate.isValid()) {
    return res.status(400).send({ message: 'Invalid date fromat for the beginning of the reservation. YYYY-MM-DD', type: 'danger' });
  }

  if (!endDate.isValid()) {
    return res.status(400).send({ message: 'Invalid date fromat for the end of the reservation. YYYY-MM-DD', type: 'danger' });
  }

  if (endDate.isBefore(beginDate)) {
    return res.status(400).send({ message: 'The beginning of the reservation must be before the end!', type: 'danger' });
  }

  if (beginDate.isSame(endDate)) {
    return res.status(400).send({ message: 'Arriving and leaving date cannot be on the same day!', type: 'dange' });
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
    userRatings: 1,
    name: 1,
    extraFeatures: 1,
    'rooms._id': 1,
    'rooms.numberOfBeds': 1,
    'rooms.price': 1,
    'rooms.extraFeatures': 1,
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
    return res.status(400).send({ message: 'Arrival and leaving date must be given!', type: 'danger' });
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
  if (req.query.extraFeatures && req.query.extraFeatures.length > 0) {
    conditions.extraFeatures = { $all: req.query.extraFeatures };
  }
  if (req.query.numberOfBeds || req.query.roomExtraFeatures) {
    const roomConditions = {};
    if (req.query.numberOfBeds) {
      roomConditions.numberOfBeds = { $eq: req.query.numberOfBeds };
    }
    if (req.query.roomExtraFeatures && req.query.roomExtraFeatures.length > 0) {
      roomConditions.roomExtraFeatures = { $all: req.query.roomExtraFeatures };
    }
    conditions.rooms.$elemMatch = roomConditions;
  }

  HotelModel.find(conditions, {
    _id: 1,
    stars: 1,
    userRatings: 1,
    name: 1,
    extraFeatures: 1,
    'rooms._id': 1,
    'rooms.numberOfBeds': 1,
    'rooms.available': 1,
    'rooms.price': 1,
    'rooms.extraFeatures': 1,
    'rooms.reservations.year': 1,
    'rooms.reservations.dayOfYear': 1,
    'rooms.reservations.numberOfGuests': 1,
  }, (error, hotels) => {
    if (error) return res.status(500).send({ message: error });
    return res.status(200).send(hotels.filter(hotel => !!hotel.rooms.filter((room) => {
      for (let date = beginDate.clone(); date.isBefore(endDate); date.add(1, 'day')) {
        const i = date.subtract(1, 'day').dayOfYear();
        date.add(1, 'day');
        if (date.isBefore(today)) {
          if (room.reservations[i].year > today.year()) {
            if (room.reservations[i].numberOfGuests === room.available) {
              return false;
            }
          }
        } else if (room.reservations[i].year >= today.year()) {
          if (room.reservations[i].numberOfGuests === room.available) {
            return false;
          }
        }
      }
      return true;
    })).map((hotel) => {
      hotel.rooms.forEach((room) => {
        room.set('remaining', room.available - room.reservations
          .filter(reserv => reserv.dayOfYear >= beginDate.dayOfYear() && reserv.dayOfYear < endDate.dayOfYear())
          .map(reserv => reserv.numberOfGuests).reduce((a, b) => (a > b ? a : b)), { strict: false });
        room.set('reservations', undefined);
        room.set('available', undefined);
      });
      return hotel;
    }));
  });
});

router.put('/hotel/add', (req, res) => {
  const now = moment.utc({ hour: 0, minute: 0, second: 0 });
  const reservations = [];
  for (let i = 0; i < 366; i += 1) {
    reservations.push({
      year: now.dayOfYear() > i + 1 ? now.year() + 1 : now.year(),
      dayOfYear: i + 1,
      guests: [],
      numberOfGuests: 0,
    });
  }

  req.body.rooms.forEach((room) => { room.reservations = reservations; });

  const hotel = new HotelModel({
    name: req.body.name,
    stars: req.body.stars,
    extraFeatures: req.body.extraFeatures,
    rooms: req.body.rooms,
  });
  hotel.save((error) => {
    if (error) return res.status(500).send({ message: 'Error while adding new hotel to the database!', type: 'danger' });
    return res.status(200).send({ message: 'Hotel added!', type: 'success' });
  });
});

router.post('/hotel/:id/room/add', (req, res) => {
  HotelModel.findOneAndUpdate({ _id: req.params.id }, { $push: { rooms: req.body } },
    (error) => {
      if (error) return res.status(500).send({ message: 'Error while adding room to the hotel!', type: 'danger' });
      return res.status(200).send({ message: 'Room added!', type: 'success' });
    });
});

router.get('/hotel/:hotelId/ratings', (req, res) => {
  computeUserRatings(req.params.hotelId).then((agg) => {
    if (agg.length === 0) {
      return res.status(404).send({ message: 'Hotel was not found.', type: 'danger' });
    }
    return res.status(200).send(agg[0]);
  }, error => res.status(500).send({ message: error, type: 'danger' }));
});

router.post('/hotel/:hotelId/rate/:rating', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send({ message: 'You have to be logged in to rate hotels!', type: 'danger' });
  }
  console.log('rating');
  RatingsModel.update({ hotelId: req.params.hotelId, userId: req.session.passport.user._id },
    { rating: req.params.rating }, { upsert: true }, (ratingsUpdateError) => {
      if (ratingsUpdateError) return res.status(500).send({ message: ratingsUpdateError, type: 'danger' });
      computeUserRatings(req.params.hotelId).then((agg) => {
        if (agg.length === 1) {
          console.log(agg);
          HotelModel.update({ _id: req.params.hotelId }, { userRatings: agg[0].ratings },
            (hotelUpdateError, doc) => {
              if (hotelUpdateError) console.log(`error updating ratings in hotel ${req.params.hotelId}: ${hotelUpdateError}`);
            });
        }
      }, computeError => console.log(`error computing ratings for hotel ${req.params.hotelId}: ${computeError}`));
      return res.status(200).send({ message: 'Thank you for your feedback!', type: 'success' });
    });
});

router.post('/hotel/:hotelId/room/:roomId/:arrival/:leaving/reserve', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(403).send({ message: 'You have to be logged in to make a reservation!', type: 'danger' });
  }

  const arrivalParam = req.params.arrival;
  const leavingParam = req.params.leaving;
  const arrivalDate = moment.utc(arrivalParam, DATE_FORMAT);
  const leavingDate = moment.utc(leavingParam, DATE_FORMAT);
  const today = moment.utc({ hour: 0, minute: 0, second: 0 });

  const fauilre = validateDateInterval(arrivalDate, leavingDate, today, res);
  if (fauilre) {
    return fauilre;
  }

  HotelModel.findById(req.params.hotelId, { 'rooms._id': 1, 'rooms.available': 1 }, (err, hotel) => {
    if (!hotel) {
      return res.status(404).send({ message: 'No such hotel!', type: 'danger' });
    }
    const selectedRoom = hotel.rooms.id(req.params.roomId);
    if (!selectedRoom) {
      return res.status(404).send({ message: 'No such room!', type: 'danger' });
    }

    // reset old reservations
    HotelModel.findByIdAndUpdate(req.params.hotelId,
      {
        $set: {
          'rooms.$[room].reservations.$[res].year': today.year() + 1,
          'rooms.$[room].reservations.$[res].numberOfGuests': 0,
          'rooms.$[room].reservations.$[res].guests': [],
        },
      },
      {
        arrayFilters: [
          { 'room._id': req.params.roomId },
          { $and: [{ 'res.dayOfYear': { $lt: today.dayOfYear() } }, { 'res.year': { $lte: today.year() } }] },
        ],
      }).then(doc => HotelModel.findByIdAndUpdate(req.params.hotelId,
      {
        $set: {
          'rooms.$[room].reservations.$[res].year': today.year(),
          'rooms.$[room].reservations.$[res].numberOfGuests': 0,
          'rooms.$[room].reservations.$[res].guests': [],
        },
      },
      {
        arrayFilters: [
          { 'room._id': req.params.roomId },
          { $and: [{ 'res.dayOfYear': { $gte: today.dayOfYear() } }, { 'res.year': { $lt: today.year() } }] },
        ],
      })).then((doc) => {
      const conditions = { _id: req.params.hotelId };
      for (let date = arrivalDate.clone(); date.isBefore(leavingDate.dayOfYear()); date.add(1, 'days')) {
        conditions[`reservations.${date.dayOfYear() - 1}.numberOfGuests`] = { $lt: hotel.rooms.id(req.params.roomId).available };
      }
      // making reservation
      HotelModel.findOneAndUpdate(conditions,
        {
          $inc: { 'rooms.$[room].reservations.$[res].numberOfGuests': 1 },
          $push: { 'rooms.$[room].reservations.$[res].guests': req.session.passport.user._id },
        },
        {
          arrayFilters: [
            { 'room._id': req.params.roomId },
            { $and: [{ 'res.dayOfYear': { $gte: arrivalDate.dayOfYear() } }, { 'res.dayOfYear': { $lt: leavingDate.dayOfYear() } }] },
          ],
        }, (err, hotel) => {
          if (err) return res.status(500).send({ message: err, type: 'danger' });
          const { user } = req.session.passport;
          sendEmail(user.username, user.email, selectedRoom.numberOfBeds, req.params.begin, req.params.end, hotel.name, (err, info) => {
            if (err) {
              console.log(`Failed to send email ${err}`);
            } else {
              console.log('Reservation notification sent...');
            }
          });
          logReservation(user._id, hotel._id, hotel.name, selectedRoom.numberOfBeds, arrivalParam, leavingParam);
          return res.status(200).send({ message: 'successful reservation!', type: 'success' });
        });
    }).catch((err) => { if (err) return res.status(500).send({ message: err, type: 'danger' }); });
  });
});

module.exports = router;

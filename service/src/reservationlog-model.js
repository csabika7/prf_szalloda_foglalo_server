const mongoose = require('mongoose');


const ratingsSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId, required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, required: true,
  },
  hotelName: { type: String },
  roomNumberOfBeds: { type: String },
  arrival: { type: String },
  leaving: { type: String },
}, { collection: 'reservationlog' });

mongoose.model('reservationlog', ratingsSchema);

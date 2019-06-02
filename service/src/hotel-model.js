const mongoose = require('mongoose');


const hotelSchema = new mongoose.Schema({
  name: {
    type: String, unique: true, required: true,
  },
  city: { type: String, required: true },
  stars: {
    type: Number, required: true, min: 1, max: 5,
  },
  userRatings: {
    type: Number, default: 0, min: 1, max: 5,
  },
  extraFeatures: { type: [String], default: [] },
  rooms: [{
    numberOfBeds: { type: Number },
    extraFeatures: { type: [String], default: [] },
    available: { type: Number },
    price: { type: Number },
    reservations: [{
      year: Number,
      dayOfYear: Number,
      guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
      numberOfGuests: Number,
    }],
  }],
}, { collection: 'hotel' });

mongoose.model('hotel', hotelSchema);

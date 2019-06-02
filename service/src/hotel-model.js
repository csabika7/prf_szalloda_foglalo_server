const mongoose = require('mongoose');


const hotelSchema = new mongoose.Schema({
  name: {
    type: String, unique: true, required: true,
  },
  city: { type: String, required: true },
  stars: { type: Number, required: true },
  userRatings: { type: Number, default: 0 },
  extraFeatures: { type: [String] },
  rooms: [{
    numberOfBeds: { type: Number },
    extraFeatures: { type: [String] },
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

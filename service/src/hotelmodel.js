const mongoose = require('mongoose');


const hotelSchema = new mongoose.Schema({
  name: {
    type: String, unique: true, required: true,
  },
  stars: { type: Number, required: true },
  userRatings: { type: Number, default: 0 },
  extra_features: { type: [String] },
  rooms: [{
    number_of_beds: { type: Number },
    extra_features: { type: [String] },
    available: { type: Number },
    reservations: [{
      year: Number,
      guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
      numberOfGuests: Number,
    }],
  }],
}, { collection: 'hotels' });

mongoose.model('hotel', hotelSchema);

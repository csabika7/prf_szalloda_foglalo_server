const mongoose = require('mongoose');


const hotelSchema = new mongoose.Schema({
  name: {
    type: String, unique: true, required: true,
  },
  stars: { type: Number, required: true },
  extra_features: { type: [String] },
  rooms: [{
    number_of_beds: { type: Number },
    extra_features: { type: [String] },
    available: { type: Number },
    reservations: {
      type: Map,
      of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    },
  }],
}, { collection: 'hotels' });

mongoose.model('hotel', hotelSchema);

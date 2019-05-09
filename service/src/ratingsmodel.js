const mongoose = require('mongoose');


const ratingsSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId, required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, required: true,
  },
  rating: { type: Number, required: true },
}, { collection: 'ratings' });

mongoose.model('rating', ratingsSchema);

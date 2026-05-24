const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true } // Absolute necessity for managing sync deletions
  },
  tagline: { type: String, required: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Carousel', carouselSchema);
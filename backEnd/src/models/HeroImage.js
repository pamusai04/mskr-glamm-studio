
const mongoose = require('mongoose');

const heroImageSchema = new mongoose.Schema({
  nameOfTheImage: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  publicId: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model('HeroImage', heroImageSchema);
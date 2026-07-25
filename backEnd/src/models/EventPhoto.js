const mongoose = require('mongoose');

const eventPhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  cloudinaryId: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    default: 'all'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likedBy: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('EventPhoto', eventPhotoSchema);
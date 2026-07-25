const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },

  serviceName: {
    type: String,
    required: true,
    trim: true
  },

  serviceImage: {
    type: String,
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  reviewMessage: {
    type: String,
    trim: true
  }

},
{
  timestamps: true
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
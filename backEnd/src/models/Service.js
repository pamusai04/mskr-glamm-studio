const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["makeup", "beauty"],
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const serviceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    trim: true
  },
  originalPrice: {
    type: Number,
    trim: true
  },
  serviceImage: {
    type: String,
    trim: true
  },
  cloudinaryId: {
    type: String,
    trim: true
  },
  bookCount: {
    type: Number,
    default: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30
  },

}, { timestamps: true });

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);
const ServiceItem = mongoose.model("ServiceItem", serviceItemSchema);

module.exports = {
  ServiceCategory,
  ServiceItem
};
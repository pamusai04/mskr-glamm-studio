const mongoose = require('mongoose');

const serviceMetaSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    trim: true
  },
  gmailId: {
    type: String,
    trim: true,
    lowercase: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      trim: true
    }
  },
  timeSlots: [{
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  }],
  shopClosureDates: [
  {
    date: {
      type: Date,
    },
    reason: {
      type: String,
      trim: true
    }
  }]

}, {
  timestamps: true
});

const ServiceMeta = mongoose.model("ServiceMeta", serviceMetaSchema);
module.exports = ServiceMeta;
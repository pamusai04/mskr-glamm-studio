const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  qrImage: {
    type: String,
    trim: true
  },
  cloudinaryId: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const QRCode = mongoose.model("QRCode", qrCodeSchema);

module.exports = QRCode;
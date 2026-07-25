const mongoose = require("mongoose");

const bookingHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookService",
      required: true,
    },
    serviceDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },

    serviceDate: Date
  },
  { timestamps: true }
);

const BookingHistory = mongoose.model("BookingHistory", bookingHistorySchema);

module.exports = BookingHistory;
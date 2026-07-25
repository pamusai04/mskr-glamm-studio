const mongoose = require("mongoose");
const BookingHistory = require("./BookingHistory");
const User = require("./User");
const { ServiceItem } = require("./Service");
const Offer = require("./Offer");

const bookServiceSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    emailId: {
      type: String,
      required: [true, "Email ID is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    serviceDate: {
      type: Date,
      required: [true, "Service date is required"],
      validate: {
        validator: function(value) {
          return value >= new Date(new Date().setHours(0, 0, 0, 0));
        },
        message: 'Service date cannot be in the past'
      }
    },
    preferredSlot: {
      startTime: {
        type: String,
        required: [true, "Start time is required"],
      },
      endTime: {
        type: String,
        required: [true, "End time is required"],
      },
      fullSlot: {
        type: String,
        required: [true, "Full slot is required"],
      }
    },
    durationDetails: {
      totalServiceMinutes: {
        type: Number,
        required: [true, "Total service minutes is required"],
        min: [0, "Total service minutes cannot be negative"],
      },
      bufferMinutes: {
        type: Number,
        default: 30,
        min: [0, "Buffer minutes cannot be negative"],
      },
      totalMinutesWithBuffer: {
        type: Number,
        required: [true, "Total minutes with buffer is required"],
        min: [0, "Total minutes with buffer cannot be negative"],
      }
    },
    homeService: {
      type: Boolean,
      default: false,
    },
    locationDetails: {
      type: String,
      default: "",
      validate: {
        validator: function(value) {
          if (this.homeService === true && (!value || value.trim() === '')) {
            return false;
          }
          return true;
        },
        message: 'Location details are required when home service is requested'
      }
    },
    specialRequest: {
      type: String,
      default: "",
      maxlength: [500, "Special request cannot exceed 500 characters"],
    },
    serviceItemIds: [
      {
        serviceItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceItem",
          required: [true, "Service item ID is required"],
        },
        numberOfPersons: {
          type: Number,
          default: 1,
          min: [1, "Number of persons must be at least 1"],
          max: [10, "Number of persons cannot exceed 10"],
        },
        calculatedDuration: {
          type: Number,
          default: 0,
          min: [0, "Calculated duration cannot be negative"],
        }
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      default: 0,
      min: [0, "Total amount cannot be negative"],
    },
    appliedOffer: {
      offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer"
      },
      title: String,
      description: String,
      offerType: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      discountValue: Number,
      discountAmount: {
        type: Number,
        default: 0,
        min: [0, "Discount amount cannot be negative"],
      }
    },
    bookedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'completed', 'cancelled'],
        message: 'Status must be pending, confirmed, completed, or cancelled'
      },
      default: 'pending'
    },
    cancellationReason: {
      type: String,
      default: null,
      validate: {
        validator: function(value) {
          if (this.status === 'cancelled' && (!value || value.trim() === '')) {
            return false;
          }
          return true;
        },
        message: 'Cancellation reason is required when status is cancelled'
      }
    }
  },
  {
    timestamps: true,
  }
);

bookServiceSchema.index({ userId: 1, 'appliedOffer.offerId': 1, status: 1 });
bookServiceSchema.index({ userId: 1, serviceDate: 1 });
bookServiceSchema.index({ status: 1, serviceDate: 1 });
bookServiceSchema.index({ 'appliedOffer.offerId': 1 });

bookServiceSchema.statics.hasUserUsedOffer = async function(userId, offerId) {
  if (!userId || !offerId) {
    throw new Error("User ID and Offer ID are required");
  }
  
  const existingBooking = await this.findOne({
    userId: userId,
    'appliedOffer.offerId': offerId,
    status: { $ne: 'cancelled' }
  }).lean();
  
  return !!existingBooking;
};

bookServiceSchema.statics.getUserOfferUsageCount = async function(userId, offerId) {
  if (!userId || !offerId) {
    throw new Error("User ID and Offer ID are required");
  }
  
  const count = await this.countDocuments({
    userId: userId,
    'appliedOffer.offerId': offerId,
    status: { $ne: 'cancelled' }
  });
  
  return count;
};

bookServiceSchema.post("save", async function(doc) {
  try {
    if (doc.serviceItemIds?.length) {
      for (const item of doc.serviceItemIds) {
        await ServiceItem.findByIdAndUpdate(
          item.serviceItemId,
          { $inc: { bookCount: item.numberOfPersons || 1 } }
        );
      }
    }

    await BookingHistory.create({
      userId: doc.userId,
      bookingId: doc._id,
      serviceDate: doc.serviceDate,
      status: doc.status || "pending",
      locationDetails: doc.locationDetails,
      homeService: doc.homeService,
      totalAmount: doc.totalAmount
    });

    if (doc.serviceItemIds?.length) {
      const ids = doc.serviceItemIds.map(i => i.serviceItemId);
      await User.findByIdAndUpdate(doc.userId, {
        $pull: { cart: { service_id: { $in: ids } } }
      });
    }

  } catch (error) {
    console.error("Post-save error:", error.message);
  }
});

const BookService = mongoose.model("BookService", bookServiceSchema);

module.exports = BookService;
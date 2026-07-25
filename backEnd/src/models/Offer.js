
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Offer title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Offer description is required"],
      trim: true,
    },
    offerType: {
      type: String,
      enum: {
        values: ['percentage', 'fixed'],
        message: 'Offer type must be either percentage or fixed'
      },
      required: [true, "Offer type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function(value) {
          if (this.offerType === 'percentage' && value > 100) {
            return false;
          }
          return true;
        },
        message: 'Percentage discount cannot exceed 100%'
      }
    },
    applicableService: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceItem",
      required: [true, "Applicable service is required"],
    },
    minAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum amount cannot be negative"],
    },
    maxUses: {
      type: Number,
      default: null,
      min: [1, "Maximum uses must be at least 1"],
    },
    currentUses: {
      type: Number,
      default: 0,
      min: [0, "Current uses cannot be negative"],
    },
    firstTimeUserOnly: {
      type: Boolean,
      default: false,
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
      validate: {
        validator: function(value) {
          return value > this.validFrom;
        },
        message: 'Valid until date must be after valid from date'
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
  }
);

offerSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
offerSchema.index({ applicableService: 1, isActive: 1 });
offerSchema.index({ validUntil: 1 });

offerSchema.methods.incrementUsage = async function() {
  if (this.maxUses && this.currentUses >= this.maxUses) {
    throw new Error("Offer has reached maximum usage limit");
  }
  this.currentUses += 1;
  return await this.save();
};

offerSchema.statics.getActiveOffers = async function(serviceId = null) {
  const currentDate = new Date();
  const query = {
    isActive: true,
    validFrom: { $lte: currentDate },
    validUntil: { $gte: currentDate }
  };
  
  if (serviceId) {
    query.applicableService = serviceId;
  }
  
  return await this.find(query)
    .populate('applicableService')
    .sort({ validUntil: 1 });
};

const Offer = mongoose.model("Offer", offerSchema);

module.exports = Offer;
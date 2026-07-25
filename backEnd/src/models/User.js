const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    minLength: 3,
    maxLength: 50
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: "male"
  },
  emailId: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    immutable: true
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'MadhuriShivaKumar'],
    default: 'user',
    required: true
  },
  profilePhoto: {
    url: {
      type: String,
      default: process.env.DEFAULT_PROFILE_PHOTO
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  otpCode: {
    type: String,
    default: null,
    select: false
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpiry: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    select: false,
    default: null
  },
  refreshTokenExpiry: {
    type: Date,
    default: null
  },
  cart: {
    type: [
      {
        service_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceItem",
          required: true
        },
        numberOfPersons: {
          type: Number,
          required: true,
          min: 1,
          default: 1
        },
        createdAt: {
          type: Date,
          default: Date.now,
          immutable: true
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

userSchema.index(
  { createdAt: 1 },
  {
    partialFilterExpression: { isEmailVerified: false },
    expireAfterSeconds: 86400
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      _id: this._id,
      emailId: this.emailId,
      role: this.role,
      isEmailVerified: this.isEmailVerified
    },
    process.env.JWT_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      emailId: this.emailId
    },
    process.env.JWT_REFRESH_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  );
};

userSchema.methods.comparePassword = async function (userPassword) {
  return await bcrypt.compare(userPassword, this.password);
};

const User = mongoose.model('user', userSchema);
module.exports = User;
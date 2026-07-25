const crypto = require('crypto');
const User = require('../models/User');

class OTPService {
  
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async storeOTP(emailId) {
    const otpCode = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);
    
    await User.findOneAndUpdate(
      { emailId },
      {
        otpCode,
        otpExpiry,
        otpAttempts: 0
      }
    );
    
    return otpCode;
  }

  async verifyOTP(emailId, userOTP) {
    const user = await User.findOne({ emailId }).select('+otpCode');
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (!user.otpCode || !user.otpExpiry) {
      return { success: false, message: 'No OTP requested. Please register again.' };
    }
    
    if (user.otpExpiry < new Date()) {
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }
    
    if (user.otpAttempts >= 5) {
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }
    
    if (user.otpCode !== userOTP) {
      const newAttemptCount = user.otpAttempts + 1;
      await User.updateOne(
        { emailId },
        { $inc: { otpAttempts: 1 } }
      );
      
      const remainingAttempts = 5 - newAttemptCount;
      return { 
        success: false, 
        message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
        remainingAttempts
      };
    }
    
    await User.updateOne(
      { emailId },
      {
        otpCode: null,
        otpExpiry: null,
        otpAttempts: 0,
        isEmailVerified: true
      }
    );
    
    return { success: true, message: 'Email verified successfully' };
  }

  async resendOTP(emailId) {
    const user = await User.findOne({ emailId });
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (user.isEmailVerified) {
      return { success: false, message: 'Email already verified' };
    }
    
    const otpCode = await this.storeOTP(emailId);
    return { success: true, otpCode };
  }

  async generateResetToken(emailId) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3 * 60 * 1000);
    
    await User.findOneAndUpdate(
      { emailId },
      {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry
      }
    );
    
    return resetToken;
  }

  async verifyResetToken(token) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() }
    });
    
    if (!user) {
      return { success: false, message: 'Invalid or expired reset token' };
    }
    
    return { success: true, user };
  }

  async clearResetToken(emailId) {
    await User.findOneAndUpdate(
      { emailId },
      {
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    );
  }

  async storeResetOTP(emailId) {
    const otpCode = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 3 * 60 * 1000);
    
    await User.findOneAndUpdate(
      { emailId },
      {
        resetPasswordToken: otpCode,
        resetPasswordExpiry: otpExpiry
      }
    );
    
    return otpCode;
  }

  async verifyResetOTP(emailId, otpCode) {
    const user = await User.findOne({ emailId }).select('+resetPasswordToken');
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    if (!user.resetPasswordToken || !user.resetPasswordExpiry) {
      return { success: false, message: 'No reset request found. Please request a new OTP.' };
    }
    
    if (user.resetPasswordExpiry < new Date()) {
      return { success: false, message: 'OTP has expired. Please request a new OTP.' };
    }
    
    if (user.resetPasswordToken !== otpCode) {
      return { success: false, message: 'Invalid OTP. Please try again.' };
    }
    
    return { success: true, user };
  }

  async clearResetOTP(emailId) {
    await User.findOneAndUpdate(
      { emailId },
      {
        resetPasswordToken: null,
        resetPasswordExpiry: null
      }
    );
  }
}

module.exports = new OTPService();
class EmailService {
  
  async sendOTPEmail(emailId, fullName, otpCode) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || 'MSK Makeover',
            email: process.env.BREVO_SENDER_EMAIL
          },
          to: [{ email: emailId, name: fullName }],
          subject: 'Verify Your Email Address',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hello ${fullName},</h2>
              <p>Your verification code is:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; background: #f0f0f0; padding: 10px; display: inline-block;">${otpCode}</h1>
              <p>This code expires in <strong>3 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </body>
            </html>
          `
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message };
      }
      
      return { success: true, messageId: data.messageId };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(emailId, fullName, resetLink) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || 'MSKR GLAMM STUDIO',
            email: process.env.BREVO_SENDER_EMAIL
          },
          to: [{ email: emailId, name: fullName }],
          subject: 'Reset Your Password',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hello ${fullName},</h2>
              <p>We received a request to reset your password.</p>
              <p><a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Reset Password</a></p>
              <p>This link expires in <strong>3 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </body>
            </html>
          `
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message };
      }
      
      return { success: true, messageId: data.messageId };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetOTPEmail(emailId, fullName, otpCode) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          sender: {
            name: process.env.BREVO_SENDER_NAME || 'MSK Makeover',
            email: process.env.BREVO_SENDER_EMAIL
          },
          to: [{ email: emailId, name: fullName }],
          subject: 'Password Reset OTP',
          htmlContent: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Hello ${fullName},</h2>
              <p>We received a request to reset your password.</p>
              <p>Your OTP for password reset is:</p>
              <h1 style="font-size: 32px; letter-spacing: 5px; background: #f0f0f0; padding: 10px; display: inline-block;">${otpCode}</h1>
              <p>This OTP expires in <strong>3 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email.</p>
            </body>
            </html>
          `
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message };
      }
      
      return { success: true, messageId: data.messageId };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
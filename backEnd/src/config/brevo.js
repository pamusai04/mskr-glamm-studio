const brevo = require('@getbrevo/brevo');

let apiInstance = null;

const initBrevo = () => {
  if (!apiInstance && process.env.BREVO_API_KEY) {
    try {

      const client = new brevo.BrevoClient({
        apiKey: process.env.BREVO_API_KEY
      });

      apiInstance = client;

      console.log('✅ Brevo email service initialized');

    } catch (error) {
      console.error('❌ Brevo initialization error:', error.message);
    }
  }

  return apiInstance;
};

const getBrevoInstance = () => {
  if (!apiInstance) {
    initBrevo();
  }

  return apiInstance;
};

const emailConfig = {
  senderEmail:
    process.env.BREVO_SENDER_EMAIL || 'noreply@yourapp.com',

  senderName:
    process.env.BREVO_SENDER_NAME || 'Your App Name'
};

module.exports = {
  initBrevo,
  getBrevoInstance,
  senderEmail: emailConfig.senderEmail,
  senderName: emailConfig.senderName
};

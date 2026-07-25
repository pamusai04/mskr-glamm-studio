const validator = require('validator');

const validateUserInput = (userData) => {
    const { fullName, emailId, password, contactNumber } = userData;
    
    if (!fullName || fullName.trim().length < 2) {
        throw new Error('Full name must be at least 2 characters');
    }
    
    if (!emailId || !validator.isEmail(emailId)) {
        throw new Error('Please provide a valid email address');
    }
    
    if (!password || !validator.isStrongPassword(password)) {
        throw new Error('Password must be strong');
    }
    
    if (!contactNumber || !validator.isMobilePhone(contactNumber, 'en-IN')) {
        throw new Error('Please provide a valid 10-digit contact number');
    }
    
    return true;
};

module.exports = validateUserInput;

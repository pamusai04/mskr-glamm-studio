

const validator = require('validator');

const validateProfileData = (fullName, gender, contactNumber) => {
    if (fullName !== undefined) {
        if (!fullName || fullName.trim().length < 3) {
            throw new Error('Full name must be at least 3 characters');
        }
        if (fullName.trim().length > 20) {
            throw new Error('Full name must be less than 20 characters');
        }
        if (!validator.isAlpha(fullName.replace(/\s/g, ''), 'en-US')) {
            throw new Error('Full name must contain only letters and spaces');
        }
    }
    
    if (gender !== undefined) {
        const validGenders = ['male', 'female', 'other'];
        if (!gender || !validGenders.includes(gender.toLowerCase())) {
            throw new Error('Gender must be male, female, or other');
        }
    }
    
    if (contactNumber !== undefined) {
        if (!contactNumber) {
            throw new Error('Contact number is required');
        }
        if (!validator.isMobilePhone(contactNumber.toString(), 'en-IN')) {
            throw new Error('Please provide a valid 10-digit contact number');
        }
    }
    

    return true;
};

module.exports = validateProfileData;
const validator = require('validator');

const validatePassword = (currentPassword, newPassword, userHasPassword = true) => {
    const errors = [];
    
    if (newPassword !== undefined && newPassword !== '') {
        if (!currentPassword) {
            errors.push('Current password is required to change password');
        }
        
        if (!validator.isLength(newPassword, { min: 8, max: 100 })) {
            errors.push('New password must be between 8 and 100 characters');
        }
        
        if (!validator.isStrongPassword(newPassword, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0
        })) {
            errors.push('New password must contain at least one uppercase letter, one lowercase letter, and one number');
        }
        
        if (currentPassword && currentPassword === newPassword) {
            errors.push('New password must be different from current password');
        }
        
        if (validator.contains(newPassword, ' ')) {
            errors.push('Password cannot contain spaces');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = validatePassword;
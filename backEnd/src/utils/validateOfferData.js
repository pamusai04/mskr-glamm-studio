const validator = require('validator');

const validateOfferData = (data) => {
  const { title, description, offerType, discountValue, applicableService, minAmount, firstTimeUserOnly, validFrom, validUntil, maxUses } = data;
  
  if (!title || validator.isEmpty(title.trim())) {
    return "Title is required";
  }
  
  if (!validator.isLength(title, { min: 3, max: 100 })) {
    return "Title must be between 3 and 100 characters";
  }
  
  if (!description || validator.isEmpty(description.trim())) {
    return "Description is required";
  }
  
  if (!validator.isLength(description, { min: 10, max: 500 })) {
    return "Description must be between 10 and 500 characters";
  }
  
  if (!offerType) {
    return "Offer type is required";
  }
  
  if (offerType !== 'percentage' && offerType !== 'fixed') {
    return "Offer type must be either 'percentage' or 'fixed'";
  }
  
  if (!discountValue && discountValue !== 0) {
    return "Discount value is required";
  }
  
  const discountNum = Number(discountValue);
  if (isNaN(discountNum) || discountNum <= 0) {
    return "Discount value must be a positive number";
  }
  
  if (offerType === 'percentage') {
    if (discountNum > 100) {
      return "Percentage discount cannot exceed 100%";
    }
  }
  
  if (!applicableService) {
    return "Service ID is required";
  }
  
  if (!validator.isMongoId(applicableService)) {
    return "Invalid service ID format";
  }
  
  if (minAmount !== undefined) {
    const minAmountNum = Number(minAmount);
    if (isNaN(minAmountNum) || minAmountNum < 0) {
      return "Minimum amount must be a positive number";
    }
  }
  
  if (firstTimeUserOnly !== undefined && typeof firstTimeUserOnly !== 'boolean') {
    return "First time user only must be a boolean value";
  }
  
  if (maxUses !== undefined) {
    const maxUsesNum = Number(maxUses);
    if (isNaN(maxUsesNum) || maxUsesNum < 1) {
      return "Maximum uses must be a positive number";
    }
  }
  
  if (!validFrom) {
    return "Valid from date is required";
  }
  
  if (!validator.isDate(validFrom)) {
    return "Valid from date must be a valid date format (YYYY-MM-DD)";
  }
  
  if (!validUntil) {
    return "Valid until date is required";
  }
  
  if (!validator.isDate(validUntil)) {
    return "Valid until date must be a valid date format (YYYY-MM-DD)";
  }
  
  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (fromDate < today) {
    return "Valid from date cannot be in the past";
  }
  
  if (untilDate <= fromDate) {
    return "Valid until date must be after valid from date";
  }
  
  const maxFutureDate = new Date();
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
  
  if (untilDate > maxFutureDate) {
    return "Valid until date cannot be more than 1 year in the future";
  }
  
  return null;
};

module.exports = validateOfferData;
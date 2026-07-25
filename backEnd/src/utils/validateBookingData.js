const validator = require('validator');
const Offer = require("../models/Offer");

const validateBookingData = async(data) => {
  const { 
    phoneNumber, 
    serviceDate, 
    preferredSlotStart,
    homeService, 
    locationDetails, 
    specialRequest,
    appliedOfferId 
  } = data;
  

  if (!phoneNumber) {
    return "Phone number is required";
  }
  
  const phoneStr = phoneNumber.toString();
  if (!validator.isMobilePhone(phoneStr, 'any', { strictMode: false })) {
    return "Please provide a valid phone number";
  }
  
  if (!validator.isLength(phoneStr, { min: 10, max: 15 })) {
    return "Phone number must be between 10 and 15 digits";
  }
  
  if (!serviceDate) {
    return "Service date is required";
  }
  
  if (!validator.isDate(serviceDate, { format: 'YYYY-MM-DD' })) {
    return "Service date must be in YYYY-MM-DD format";
  }
  
  const providedDate = new Date(serviceDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (providedDate < today) {
    return "Service date cannot be in the past";
  }
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  
  if (providedDate > maxDate) {
    return "Service date cannot be more than 60 days in advance";
  }
  
  if (!preferredSlotStart) {
    return "Preferred slot start time is required";
  }
  
  const trimmedStartTime = preferredSlotStart.toString().trim();
  if (!validator.isLength(trimmedStartTime, { min: 4, max: 20 })) {
    return "Preferred slot start time must be between 4 and 20 characters";
  }
  
  const time12HourRegex = /^(0?[0-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
  const time24HourRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  
  let isValidTime = false;
  let hours = null;
  let minutes = null;
  
  if (time12HourRegex.test(trimmedStartTime)) {
    isValidTime = true;
    const match = trimmedStartTime.match(time12HourRegex);
    hours = parseInt(match[1]);
    minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  else if (time24HourRegex.test(trimmedStartTime)) {
    isValidTime = true;
    const match = trimmedStartTime.match(time24HourRegex);
    hours = parseInt(match[1]);
    minutes = parseInt(match[2]);
  }
  
  if (!isValidTime) {
    return "Preferred slot start time must be in format: 'HH:MM AM/PM' (e.g., '09:00 AM' or '2:00 PM') or 24-hour format '14:00'";
  }
  
  if (minutes < 0 || minutes > 59) {
    return "Minutes must be between 0 and 59";
  }
  
  const BUSINESS_HOURS_START = 9;
  const BUSINESS_HOURS_END = 21;
  
  if (hours < BUSINESS_HOURS_START || hours > BUSINESS_HOURS_END) {
    return `Service start time must be between ${BUSINESS_HOURS_START}:00 AM and ${BUSINESS_HOURS_END}:00 PM`;
  }
  
  if (homeService === undefined || homeService === null) {
    return "Home service preference is required (true/false)";
  }
  
  const isHomeService = homeService === true || homeService === 'true';
  
  if (isHomeService) {
    if (!locationDetails) {
      return "Location details are required when home service is requested";
    }
    
    const trimmedLocation = locationDetails.toString().trim();
    if (validator.isEmpty(trimmedLocation)) {
      return "Location details cannot be empty";
    }
    
    if (!validator.isLength(trimmedLocation, { min: 10, max: 500 })) {
      return "Location details must be between 10 and 500 characters";
    }
    
    const hasAddressComponents = /(door|house|building|street|road|area|city|pincode|zip|near|landmark)/i.test(trimmedLocation);
    if (!hasAddressComponents && trimmedLocation.length < 20) {
      return "Please provide a complete address with proper details (door number, street, city, etc.)";
    }
  }
  
  if (specialRequest !== undefined && specialRequest !== null) {
    const trimmedRequest = specialRequest.toString().trim();
    if (trimmedRequest && !validator.isLength(trimmedRequest, { max: 500 })) {
      return "Special request cannot exceed 500 characters";
    }
    
    if (trimmedRequest && !validator.isLength(trimmedRequest, { min: 2 })) {
      return "Special request must be at least 2 characters if provided";
    }
  }
  
  if (appliedOfferId !== undefined && appliedOfferId !== null && appliedOfferId !== '') {
    if (!validator.isMongoId(appliedOfferId.toString())) {
      return "Invalid offer ID format";
    }
  }
  // VALIDATE OFFER WITH MAX USES CHECK
  if (appliedOfferId !== undefined && appliedOfferId !== null && appliedOfferId !== '') {
    if (!validator.isMongoId(appliedOfferId.toString())) {
      return "Invalid offer ID format";
    }
    
    try {
      // Fetch the offer from database
      const offer = await Offer.findById(appliedOfferId);
      
      if (!offer) {
        return "Offer not found";
      }
      
      // // Check if offer is active
      // if (!offer.isActive) {
      //   return "This offer is no longer active";
      // }
      
      // // Check date validity
      // const currentDate = new Date();
      // if (offer.validFrom > currentDate) {
      //   return `This offer is valid from ${offer.validFrom.toLocaleDateString()}`;
      // }
      
      // if (offer.validUntil < currentDate) {
      //   return "This offer has expired";
      // }
      
      // CHECK MAX USES CONDITION
      if (offer.maxUses !== null && offer.maxUses !== undefined) {
        if (offer.currentUses >= offer.maxUses) {
          return `This offer has reached its maximum usage limit of ${offer.maxUses} uses`;
        }
      }
      
    } catch (error) {
      
      return "Error validating offer. Please try again.";
    }
  }

  return null;
};

module.exports = validateBookingData;
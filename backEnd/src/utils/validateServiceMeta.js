const validateServiceMeta = (metaData, isUpdate = false) => {
  const { locationName, phoneNumber, gmailId, location, timeSlots, eventPhotos } = metaData;

  if (!isUpdate || (isUpdate && locationName !== undefined)) {
    if (!locationName || locationName.trim().length < 2) {
      throw new Error("Location name is required and must be at least 2 characters");
    }
    if (locationName && locationName.trim().length > 100) {
      throw new Error("Location name cannot exceed 100 characters");
    }
  }

  if (!isUpdate || (isUpdate && phoneNumber !== undefined)) {
    if (!phoneNumber || phoneNumber.toString().trim().length < 10) {
      throw new Error("Phone number is required and must be at least 10 digits");
    }
    if (phoneNumber && phoneNumber.toString().trim().length > 15) {
      throw new Error("Phone number cannot exceed 15 digits");
    }
  }

  if (!isUpdate || (isUpdate && gmailId !== undefined)) {
    if (!gmailId || !gmailId.trim()) {
      throw new Error("Gmail ID is required");
    }
    
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(gmailId.trim())) {
      throw new Error("Invalid Gmail address. Must be a valid @gmail.com email");
    }
  }

  if (!isUpdate || (isUpdate && location !== undefined)) {
    if (!location) {
      throw new Error("Location coordinates are required");
    }
    
    if (location.lat === undefined || location.lat === null) {
      throw new Error("Latitude is required");
    }
    
    const lat = parseFloat(location.lat);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error("Latitude must be a number between -90 and 90");
    }
    
    if (location.lng === undefined || location.lng === null) {
      throw new Error("Longitude is required");
    }
    
    const lng = parseFloat(location.lng);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      throw new Error("Longitude must be a number between -180 and 180");
    }
    
    if (location.address !== undefined && location.address !== null) {
      const addressStr = location.address.toString().trim();
      if (addressStr && (addressStr.length < 5 || addressStr.length > 500)) {
        throw new Error("Address must be between 5 and 500 characters");
      }
    }
  }

  if (!isUpdate || (isUpdate && timeSlots !== undefined)) {
    if (!timeSlots || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      throw new Error("At least one time slot is required");
    }
    
    if (timeSlots.length > 20) {
      throw new Error("Maximum 20 time slots allowed");
    }

    const convertToMinutes = (timeStr) => {
      let hours, minutes, period;
      const time12HourRegex = /^(0?[0-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
      
      if (time12HourRegex.test(timeStr)) {
        const match = timeStr.match(time12HourRegex);
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      } else {
        const [h, m] = timeStr.split(':');
        hours = parseInt(h);
        minutes = parseInt(m);
      }
      
      return hours * 60 + minutes;
    };

    timeSlots.forEach((slot, index) => {
      if (!slot.startTime || typeof slot.startTime !== "string" || !slot.startTime.trim()) {
        throw new Error(`TimeSlot ${index + 1}: startTime is required`);
      }

      if (!slot.endTime || typeof slot.endTime !== "string" || !slot.endTime.trim()) {
        throw new Error(`TimeSlot ${index + 1}: endTime is required`);
      }
      
      const startTimeStr = slot.startTime.trim();
      const endTimeStr = slot.endTime.trim();
      
      const time12HourRegex = /^(0?[0-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
      const time24HourRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      
      const startValid = time12HourRegex.test(startTimeStr) || time24HourRegex.test(startTimeStr);
      const endValid = time12HourRegex.test(endTimeStr) || time24HourRegex.test(endTimeStr);
      
      if (!startValid) {
        throw new Error(`TimeSlot ${index + 1}: Invalid startTime format '${startTimeStr}'. Use 'HH:MM AM/PM' or 'HH:MM'`);
      }
      
      if (!endValid) {
        throw new Error(`TimeSlot ${index + 1}: Invalid endTime format '${endTimeStr}'. Use 'HH:MM AM/PM' or 'HH:MM'`);
      }
      
      const startMinutes = convertToMinutes(startTimeStr);
      const endMinutes = convertToMinutes(endTimeStr);
      
      if (endMinutes <= startMinutes) {
        throw new Error(`TimeSlot ${index + 1}: End time must be after start time`);
      }
      
      if (endMinutes - startMinutes < 30) {
        throw new Error(`TimeSlot ${index + 1}: Time slot duration must be at least 30 minutes`);
      }
      
      if (endMinutes - startMinutes > 720) {
        throw new Error(`TimeSlot ${index + 1}: Time slot duration cannot exceed 12 hours`);
      }
    });
    
    const sortedSlots = [...timeSlots].sort((a, b) => {
      return convertToMinutes(a.startTime.trim()) - convertToMinutes(b.startTime.trim());
    });
    
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentEnd = convertToMinutes(sortedSlots[i].endTime.trim());
      const nextStart = convertToMinutes(sortedSlots[i + 1].startTime.trim());
      
      if (currentEnd > nextStart) {
        throw new Error(`TimeSlot ${i + 1} and ${i + 2} have overlapping time ranges`);
      }
    }
  }

  if (eventPhotos !== undefined) {
    if (!Array.isArray(eventPhotos)) {
      throw new Error("eventPhotos must be an array");
    }
    
    if (eventPhotos.length > 50) {
      throw new Error("Maximum 50 event photos allowed");
    }

    eventPhotos.forEach((photo, index) => {
      if (!photo.url || typeof photo.url !== "string" || !photo.url.trim()) {
        throw new Error(`EventPhoto ${index + 1}: url is required`);
      }
      
      if (!photo.title || typeof photo.title !== "string" || !photo.title.trim()) {
        throw new Error(`EventPhoto ${index + 1}: title is required`);
      }
      
      if (photo.title && photo.title.trim().length > 100) {
        throw new Error(`EventPhoto ${index + 1}: title cannot exceed 100 characters`);
      }
      
      if (photo.category && photo.category.trim().length > 50) {
        throw new Error(`EventPhoto ${index + 1}: category cannot exceed 50 characters`);
      }
      
      if (photo.description && photo.description.trim().length > 500) {
        throw new Error(`EventPhoto ${index + 1}: description cannot exceed 500 characters`);
      }
      
      if (photo.likes !== undefined && (typeof photo.likes !== 'number' || photo.likes < 0)) {
        throw new Error(`EventPhoto ${index + 1}: likes must be a non-negative number`);
      }
    });
  }

  return true;
};

module.exports = validateServiceMeta;
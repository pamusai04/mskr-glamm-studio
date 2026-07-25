const ServiceMeta = require("../models/serviceMetaSchema");
const User = require("../models/User");
const mongoose = require("mongoose");
const BookService = require('../models/bookService');
const validateServiceMeta = require("../utils/validateServiceMeta");
const { ServiceItem } = require("../models/Service");
const { cloudinary } = require("../config/cloudinary");
const moment = require("moment-timezone");

const addServiceMeta = async (req, res) => {
  try {
    let existing = await ServiceMeta.findOne({});
    
    if (!existing) {
      let timeSlots = req.body.timeSlots;
      if (typeof timeSlots === 'string') {
        try {
          timeSlots = JSON.parse(timeSlots);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid timeSlots format"
          });
        }
      }

      if (timeSlots && Array.isArray(timeSlots)) {
        timeSlots.forEach((slot, index) => {
          if (!slot.startTime?.trim()) {
            throw new Error(`TimeSlot ${index + 1}: startTime is required`);
          }
          if (!slot.endTime?.trim()) {
            throw new Error(`TimeSlot ${index + 1}: endTime is required`);
          }
        });
      }

      let locationData = req.body.location;
      if (typeof locationData === 'string') {
        try {
          locationData = JSON.parse(locationData);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid location format"
          });
        }
      }

      if (!locationData || !locationData.lat || !locationData.lng) {
        return res.status(400).json({
          success: false,
          message: "Location (lat and lng) is required for first time creation"
        });
      }

      const meta = await ServiceMeta.create({
        locationName: req.body.locationName || '',
        phoneNumber: req.body.phoneNumber || '',
        gmailId: req.body.gmailId || '',
        location: {
          lat: parseFloat(locationData.lat),
          lng: parseFloat(locationData.lng),
          address: locationData.address || ''
        },
        timeSlots: timeSlots || []
      });

      return res.status(201).json({
        success: true,
        message: "Service meta created successfully",
        data: meta
      });
    }
    
    const updates = {};

    if (req.body.locationName && req.body.locationName.length > 0) {
      updates.locationName = req.body.locationName;
    }

    if (req.body.phoneNumber && req.body.phoneNumber.length >= 10) {
      updates.phoneNumber = req.body.phoneNumber;
    }

    if (req.body.gmailId && req.body.gmailId.trim()) {
      const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(req.body.gmailId)) {
        throw new Error("Invalid Gmail address. Must be a valid @gmail.com email");
      }
      updates.gmailId = req.body.gmailId;
    }

    if (req.body.location) {
      let locationData = req.body.location;
      if (typeof locationData === 'string') {
        try {
          locationData = JSON.parse(locationData);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid location format"
          });
        }
      }
      
      updates.location = {};
      
      if (locationData.lat !== undefined) {
        const lat = parseFloat(locationData.lat);
        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error("Latitude must be a number between -90 and 90");
        }
        updates.location.lat = lat;
      }
      
      if (locationData.lng !== undefined) {
        const lng = parseFloat(locationData.lng);
        if (isNaN(lng) || lng < -180 || lng > 180) {
          throw new Error("Longitude must be a number between -180 and 180");
        }
        updates.location.lng = lng;
      }
      
      if (locationData.address !== undefined) {
        updates.location.address = locationData.address;
      }
    }

    if (req.body.timeSlots) {
      let timeSlotsData = req.body.timeSlots;
      if (typeof timeSlotsData === 'string') {
        try {
          timeSlotsData = JSON.parse(timeSlotsData);
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid timeSlots format"
          });
        }
      }
      
      if (Array.isArray(timeSlotsData) && timeSlotsData.length > 0) {
        timeSlotsData.forEach((slot, index) => {
          if (!slot.startTime?.trim()) {
            throw new Error(`TimeSlot ${index + 1}: startTime is required`);
          }
          if (!slot.endTime?.trim()) {
            throw new Error(`TimeSlot ${index + 1}: endTime is required`);
          }
        });
        
        updates.timeSlots = timeSlotsData;
      }
    }

    const updated = await ServiceMeta.findByIdAndUpdate(
      existing._id,
      updates,
      { 
        returnDocument: 'after',
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Service meta updated successfully",
      data: {
        locationName: updated.locationName,
        phoneNumber: updated.phoneNumber,
        gmailId: updated.gmailId,
        location: updated.location,
        timeSlots: updated.timeSlots
      }
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllServiceMeta = async (req, res) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    await ServiceMeta.updateMany(
      {},
      {
        $pull: {
          shopClosureDates: {
            date: { $lt: currentDate }
          }
        }
      }
    );

    const response = await ServiceMeta.find();
    const userCount = await User.countDocuments();
    const bookingCount = await BookService.countDocuments();
    const serviceCount = await ServiceItem.countDocuments();
    
    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No service metadata found"
      });
    }

    const cleanedResponse = response.map(service => {
      const serviceObj1 = service.toObject();
      const { updatedAt, __v, ...serviceObj } = serviceObj1;
      return serviceObj;
    });

    const data = {
      serviceMeta: cleanedResponse,
      usersCount: userCount,
      bookingsCount: bookingCount,
      servicesCount: serviceCount
    };
    
    res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteServiceMetaItem = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "ID is required"
      });
    }

    const objectId = new mongoose.Types.ObjectId(_id);

    let updated = await ServiceMeta.findOneAndUpdate(
      { "timeSlots._id": objectId },
      { $pull: { timeSlots: { _id: objectId } } },
      { returnDocument: 'after' }
    );
    
    if (updated) {
      return res.status(200).json({
        success: true,
        message: "Time slot deleted successfully",
        data: updated
      });
    }

    return res.status(404).json({
      success: false,
      message: "Time slot not found"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const addShopClosureDate = async (req, res) => {
  try {
    const { date, reason } = req.body;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    let closureDate;
    let originalDateString = date;
    
    if (date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        originalDateString = `${year}-${month}-${day}`;
        closureDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      } else {
        throw new Error("Invalid date format");
      }
    } else {
      closureDate = new Date(date);
    }
    
    if (isNaN(closureDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    const serviceMeta = await ServiceMeta.findOne({});
    
    if (!serviceMeta) {
      return res.status(404).json({
        success: false,
        message: "Service meta not found"
      });
    }

    const newClosureDate = {
      date: closureDate,
      reason: reason || "",
      _id: new mongoose.Types.ObjectId()
    };

    serviceMeta.shopClosureDates.push(newClosureDate);
    await serviceMeta.save();

    res.status(200).json({
      success: true,
      message: "Shop closure date added successfully",
      data: {
        date: originalDateString,
        reason: reason || "",
        _id: newClosureDate._id
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteShopClosureDate = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Closure date ID is required"
      });
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const serviceMeta = await ServiceMeta.findOneAndUpdate(
      { "shopClosureDates._id": objectId },
      { $pull: { shopClosureDates: { _id: objectId } } },
      { returnDocument: 'after' }
    );

    if (!serviceMeta) {
      return res.status(404).json({
        success: false,
        message: "Shop closure date not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Shop closure date deleted successfully",
      data: serviceMeta
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  addServiceMeta,
  getAllServiceMeta,
  deleteServiceMetaItem,
  addShopClosureDate,
  deleteShopClosureDate
};
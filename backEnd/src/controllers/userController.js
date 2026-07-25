const BookService = require("../models/bookService");
const Review = require("../models/review");
const User = require("../models/User");
const { ServiceCategory, ServiceItem } = require("../models/Service");
const validateBookingData = require("../utils/validateBookingData");
const validateReviewData = require("../utils/validateReviewData");
const ServiceMeta = require('../models/serviceMetaSchema');
const validator = require('validator');
const moment = require('moment-timezone');
const Offer = require("../models/Offer");
const OfferService = require("../services/offerService");
const EventPhoto = require("../models/EventPhoto");
const mongoose = require("mongoose");
const { cloudinary } = require("../config/cloudinary");


const validateProfileData = require("../utils/validateProfileData");

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

    const eventPhotos = await EventPhoto.find()
      .sort({ createdAt: -1 })
      .select('category title description url _id createdAt'); 

    const transformedEventPhotos = eventPhotos.map(photo => ({
      _id: photo._id,
      category: photo.category,
      title: photo.title,
      url: photo.url,
      description : photo.description,
      views: userCount,
      createdAt: photo.createdAt
    }));

    const cleanedResponse = response.map(service => {
      const serviceObj1 = service.toObject();
      const { updatedAt, __v, ...serviceObj } = serviceObj1;
      return serviceObj;
    });

    const data = {
      serviceMeta: cleanedResponse,
      eventPhotos: transformedEventPhotos || [],
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

const applyOfferToCart = async (req, res) => {
  try {
    const { offerId } = req.body;
    
    if (!offerId) {
      return res.status(400).json({
        success: false,
        message: "Offer ID is required"
      });
    }

    const user = await User.findById(req.user._id).populate('cart.service_id');

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const result = await OfferService.applyOfferToCart(user.cart, req.user._id, offerId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error("Apply offer error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllServices = async (req, res) => {
  try {
    const data = await ServiceCategory.aggregate([
      {
        $lookup: {
          from: "serviceitems", 
          localField: "_id",
          foreignField: "categoryId",
          as: "items"
        }
      },
      {
        $project: {
          title: 1,
          icon: 1,
          type: 1,
          category: 1,
          items: {
            _id: 1,
            name: 1,
            desc: 1,
            price: 1,
            duration : 1,
            originalPrice : 1,
            serviceImage: 1,
            bookCount: 1
          }
        }
      }
    ]);

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

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        emailId: user.emailId,
        role: user.role,
        profilePhoto: user.profilePhoto,
        gender: user.gender,
        isActive: user.isActive !== undefined ? user.isActive : true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName, gender, contactNumber } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Validate the data
    try {
      validateProfileData(fullName, gender, contactNumber);
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: validationError.message
      });
    }
    
    const updateData = {};
    
    if (fullName !== undefined) {
      updateData.fullName = fullName.trim();
    }
    
    if (gender !== undefined) {
      updateData.gender = gender.toLowerCase();
    }
    
    if (contactNumber !== undefined) {
      updateData.contactNumber = contactNumber.toString();
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');
    
    const cartCount = updatedUser.cart ? updatedUser.cart.length : 0;
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        emailId: updatedUser.emailId,
        role: updatedUser.role,
        profilePhoto: updatedUser.profilePhoto,
        gender: updatedUser.gender,
        contactNumber: updatedUser.contactNumber,
        isActive: updatedUser.isActive !== undefined ? updatedUser.isActive : true,
        cartCount: cartCount,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

const calculateCartSummary = (cartItems, applicableOffers = []) => {
  let totalServices = 0;
  let subtotal = 0;
  let totalDiscount = 0;
  
  const itemsWithTotals = cartItems.map(item => {
    const itemTotal = item.service_id.price * item.numberOfPersons;
    totalServices += item.numberOfPersons;
    subtotal += itemTotal;
    
    let discount = 0;
    let finalPrice = itemTotal;
    let appliedOffer = null;
    
    const matchingOffer = applicableOffers.find(offer => 
      offer.serviceId === item.service_id._id && offer.offer
    );
    
    if (matchingOffer && matchingOffer.offer) {
      discount = matchingOffer.offer.discountAmount;
      finalPrice = itemTotal - discount;
      totalDiscount += discount;
      appliedOffer = matchingOffer.offer;
    }
    
    return {
      _id: item._id,
      service_id: item.service_id,
      numberOfPersons: item.numberOfPersons,
      itemTotal: itemTotal,
      discount: discount,
      finalPrice: finalPrice,
      appliedOffer: appliedOffer
    };
  });
  
  return {
    totalServices: totalServices,
    subtotal: subtotal,
    totalDiscount: totalDiscount,
    total: subtotal - totalDiscount,
    items: itemsWithTotals
  };
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.service_id');
    
    const cartItems = user.cart
      .filter(item => item.service_id !== null && item.service_id !== undefined)
      .map(item => ({
        _id: item._id,
        service_id: {
          _id: item.service_id._id,
          name: item.service_id.name,
          desc: item.service_id.desc,
          price: item.service_id.price,
          duration : item.service_id.duration,
          originalPrice : item.service_id.originalPrice,
          serviceImage: item.service_id.serviceImage
        },
        numberOfPersons: item.numberOfPersons,
      }));
    
    const applicableOffersResult = await OfferService.getCartApplicableOffers(user.cart, req.user._id);
    const applicableOffers = applicableOffersResult.offers || [];
    
    const summary = calculateCartSummary(cartItems, applicableOffers);
    
    res.status(200).json({
      success: true,
      data: {
        cart: summary.items,
        totalServices: summary.totalServices,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        total: summary.total,
        applicableOffers: applicableOffers.filter(offer => offer.offer !== null)
      }
    });
  } catch (error) {
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { service_id } = req.body;
    
    if (!service_id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await ServiceItem.findById(service_id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const user = await User.findById(req.user._id);
    
    const existingItem = user.cart.find(
      item => item.service_id && item.service_id.toString() === service_id
    );

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Service already exists in cart"
      });
    }
    
    user.cart.push({
      service_id,
      numberOfPersons: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();
    await user.populate('cart.service_id');
    
    const cartItems = user.cart
      .filter(item => item.service_id !== null)
      .map(item => ({
        _id: item._id,
        service_id: {
          _id: item.service_id._id,
          name: item.service_id.name,
          desc: item.service_id.desc,
          price: item.service_id.price,
          duration : item.service_id.duration,
          originalPrice : item.service_id.originalPrice,
          serviceImage: item.service_id.serviceImage
        },
        numberOfPersons: item.numberOfPersons
      }));
    

    const applicableOffersResult = await OfferService.getCartApplicableOffers(user.cart, req.user._id);
    const applicableOffers = applicableOffersResult.offers || [];
    const summary = calculateCartSummary(cartItems, applicableOffers);
    
    res.status(200).json({
      success: true,
      message: "Service added to cart",
      data: {
        cart: summary.items,
        totalServices: summary.totalServices,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        total: summary.total,
        applicableOffers: applicableOffers.filter(offer => offer.offer !== null)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { cart_item_id } = req.body;

    if (!cart_item_id) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is already empty",
      });
    }
    
    const itemExists = user.cart.some(
      item => item._id.toString() === cart_item_id
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Cart service not found",
      });
    }
    
    user.cart = user.cart.filter(
      item => item._id.toString() !== cart_item_id
    );

    await user.save();
    await user.populate('cart.service_id');
    
    const cartItems = user.cart
      .filter(item => item.service_id !== null)
      .map(item => ({
        _id: item._id,
        service_id: {
          _id: item.service_id._id,
          name: item.service_id.name,
          desc: item.service_id.desc,
          price: item.service_id.price,
          duration : item.service_id.duration,
          originalPrice : item.service_id.originalPrice,
          serviceImage: item.service_id.serviceImage
        },
        numberOfPersons: item.numberOfPersons
      }));
    
    const applicableOffersResult = await OfferService.getCartApplicableOffers(user.cart, req.user._id);
    const applicableOffers = applicableOffersResult.offers || [];
    const summary = calculateCartSummary(cartItems, applicableOffers);
    
    res.status(200).json({
      success: true,
      message: "Service removed from cart",
      data: {
        cart: summary.items,
        totalServices: summary.totalServices,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        total: summary.total,
        applicableOffers: applicableOffers.filter(offer => offer.offer !== null),
        isCartEmpty: cartItems.length === 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const incrementCart = async (req, res) => {
  try {
    const { cart_item_id } = req.body;

    if (!cart_item_id) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }
    
    const user = await User.findById(req.user._id);
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const item = user.cart.id(cart_item_id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart service not found",
      });
    }

    const MAX_QUANTITY = 10;
    if (item.numberOfPersons >= MAX_QUANTITY) {
      return res.status(400).json({
        success: false,
        message: `Maximum numberOfPersons limit of ${MAX_QUANTITY} reached`,
      });
    }

    item.numberOfPersons += 1;
    item.updatedAt = Date.now();

    await user.save();
    await user.populate('cart.service_id');
    
    const cartItems = user.cart
      .filter(item => item.service_id !== null)
      .map(item => ({
        _id: item._id,
        service_id: {
          _id: item.service_id._id,
          name: item.service_id.name,
          desc: item.service_id.desc,
          price: item.service_id.price,
          duration : item.service_id.duration,
          originalPrice : item.service_id.originalPrice,
          serviceImage: item.service_id.serviceImage
        },
        numberOfPersons: item.numberOfPersons,
      }));
    
    const applicableOffersResult = await OfferService.getCartApplicableOffers(user.cart, req.user._id);
    const applicableOffers = applicableOffersResult.offers || [];
    const summary = calculateCartSummary(cartItems, applicableOffers);
    
    res.status(200).json({
      success: true,
      message: "Number Of Persons increased",
      data: {
        cart: summary.items,
        totalServices: summary.totalServices,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        total: summary.total,
        applicableOffers: applicableOffers.filter(offer => offer.offer !== null),
        isCartEmpty: cartItems.length === 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const decrementCart = async (req, res) => {
  try {
    const { cart_item_id } = req.body;

    if (!cart_item_id) {
      return res.status(400).json({
        success: false,
        message: "Cart item ID is required",
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const item = user.cart.id(cart_item_id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    if (item.numberOfPersons <= 1) {
      return res.status(400).json({
        success: false,
        message: "Cannot decrease below 1",
      });
    }

    item.numberOfPersons -= 1;
    item.updatedAt = Date.now();

    await user.save();
    await user.populate('cart.service_id');
    
    const cartItems = user.cart
      .filter(item => item.service_id !== null)
      .map(item => ({
        _id: item._id,
        service_id: {
          _id: item.service_id._id,
          name: item.service_id.name,
          desc: item.service_id.desc,
          price: item.service_id.price,
          duration : item.service_id.duration,
          originalPrice : item.service_id.originalPrice,
          serviceImage: item.service_id.serviceImage
        },
        numberOfPersons: item.numberOfPersons,
      }));
    
    const applicableOffersResult = await OfferService.getCartApplicableOffers(user.cart, req.user._id);
    const applicableOffers = applicableOffersResult.offers || [];
    const summary = calculateCartSummary(cartItems, applicableOffers);
    
    res.status(200).json({
      success: true,
      message: "Number Of Persons decreased",
      data: {
        cart: summary.items,
        totalServices: summary.totalServices,
        subtotal: summary.subtotal,
        totalDiscount: summary.totalDiscount,
        total: summary.total,
        applicableOffers: applicableOffers.filter(offer => offer.offer !== null),
        isCartEmpty: cartItems.length === 0
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const response = await BookService.find({ userId: req.user._id })
      .populate({
        path: "serviceItemIds.serviceItemId",
        select: "name price serviceImage duration"
      })
      .populate({
        path: "appliedOffer.offerId",
        select: "title description offerType discountValue"
      })
      .sort({ createdAt: -1 });


    const data = response.map(item => ({
      _id: item._id,
      fullName: item.fullName,
      phoneNumber: item.phoneNumber,
      emailId: item.emailId,
      serviceDate: item.serviceDate,
      preferredSlot: item.preferredSlot,
      homeService: item.homeService,
      locationDetails: item.locationDetails,
      specialRequest: item.specialRequest,
      status: item.status,
      cancellationReason : item.cancellationReason,
      bookedDate: item.bookedDate,
      totalAmount: item.totalAmount,
      appliedOffer: item.appliedOffer ? {
        offerId: item.appliedOffer.offerId ? {
          _id: item.appliedOffer.offerId._id,
          title: item.appliedOffer.offerId.title,
          description: item.appliedOffer.offerId.description,
          offerType: item.appliedOffer.offerId.offerType,
          discountValue: item.appliedOffer.offerId.discountValue
        } : null,
        title: item.appliedOffer.title,
        description: item.appliedOffer.description,
        offerType: item.appliedOffer.offerType,
        discountValue: item.appliedOffer.discountValue,
        discountAmount: item.appliedOffer.discountAmount
      } : null,
      serviceItemIds: item.serviceItemIds
        .filter(i => i.serviceItemId !== null)
        .map(i => ({
          _id: i.serviceItemId._id,
          name: i.serviceItemId.name,
          price: i.serviceItemId.price,
          duration : i.serviceItemId.duration,
          serviceImage: i.serviceItemId.serviceImage,
          numberOfPersons: i.numberOfPersons  
        }))
    }));

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

const sendReview = async (req, res) => {
  try {
    const error = validateReviewData(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    const { serviceName, serviceImage, rating, reviewMessage } = req.body;
    
    const numericRating = Number(rating);
    
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5"
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      serviceName,
      serviceImage,
      rating: numericRating,
      reviewMessage
    });
    
    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong"
    });
  }
};

const getReview = async (req, res) => {
  try {
    const data = await Review.find({});
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getSlotAvailability = async (req, res) => {
  try {
    const today = moment().tz('Asia/Kolkata');
    const startDate = today.clone().startOf('day');
    const endDate = today.clone().add(60, 'days').endOf('day');
    
    const serviceMeta = await ServiceMeta.findOne();
    
    if (!serviceMeta || !serviceMeta.timeSlots || serviceMeta.timeSlots.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No time slots configured"
      });
    }
    
    const closureDates = serviceMeta.shopClosureDates || [];
    const closureDateSet = new Set();
    
    closureDates.forEach(closure => {
      const closureDate = moment(closure.date).tz('Asia/Kolkata').format('YYYY-MM-DD');
      closureDateSet.add(closureDate);
    });
    
    const bookings = await BookService.find({
      serviceDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate()
      },
      status: { $ne: 'cancelled' }
    }).select('preferredSlot serviceDate');
    
    const bookedMap = {};
    
    bookings.forEach(booking => {
      const bookingDate = moment(booking.serviceDate).tz('Asia/Kolkata');
      const dateStr = bookingDate.format('YYYY-MM-DD');
      
      if (!bookedMap[dateStr]) {
        bookedMap[dateStr] = [];
      }
      
      let bookedStart = null;
      let bookedEnd = null;
      
      if (booking.preferredSlot && booking.preferredSlot.fullSlot) {
        const [start, end] = booking.preferredSlot.fullSlot.split(' - ');
        bookedStart = start.trim();
        bookedEnd = end.trim();
      } else if (typeof booking.preferredSlot === 'string') {
        const [start, end] = booking.preferredSlot.split(' - ');
        bookedStart = start.trim();
        bookedEnd = end.trim();
      }
      
      if (bookedStart && bookedEnd) {
        bookedMap[dateStr].push({ start: bookedStart, end: bookedEnd });
      }
    });
    
    const normalizeTime = (timeStr) => {
      let hours, minutes, period;
      const time12HourRegex = /^(0?[0-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
      const time24HourRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      
      if (time12HourRegex.test(timeStr)) {
        const match = timeStr.match(time12HourRegex);
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      } else if (time24HourRegex.test(timeStr)) {
        const [h, m] = timeStr.split(':');
        hours = parseInt(h);
        minutes = parseInt(m);
      } else {
        return null;
      }
      
      return hours * 60 + minutes;
    };
    
    const result = [];
    const currentTime = moment().tz('Asia/Kolkata');
    
    for (let i = 0; i <= 60; i++) {
      const currentDate = startDate.clone().add(i, 'days');
      const dateStr = currentDate.format('YYYY-MM-DD');
      
      if (closureDateSet.has(dateStr)) {
        result.push({
          date: dateStr,
          available: [],
          availableCount: 0
        });
        continue;
      }
      
      const bookedSlots = bookedMap[dateStr] || [];
      let availableSlots = [];
      
      for (const originalSlot of serviceMeta.timeSlots) {
        const slotStart = originalSlot.startTime;
        const slotEnd = originalSlot.endTime;
        
        const slotStartMinutes = normalizeTime(slotStart);
        const slotEndMinutes = normalizeTime(slotEnd);
        
        const relevantBookings = bookedSlots.filter(booked => {
          const bookedStartMinutes = normalizeTime(booked.start);
          const bookedEndMinutes = normalizeTime(booked.end);
          return bookedStartMinutes >= slotStartMinutes && bookedEndMinutes <= slotEndMinutes;
        }).sort((a, b) => {
          return normalizeTime(a.start) - normalizeTime(b.start);
        });
        
        if (relevantBookings.length === 0) {
          availableSlots.push(`${slotStart} - ${slotEnd}`);
        } else {
          let currentStart = slotStart;
          let currentStartMinutes = slotStartMinutes;
          
          for (const booking of relevantBookings) {
            const bookingStartMinutes = normalizeTime(booking.start);
            
            if (bookingStartMinutes > currentStartMinutes) {
              const gapMinutes = bookingStartMinutes - currentStartMinutes;
              if (gapMinutes >= 30) {
                availableSlots.push(`${currentStart} - ${booking.start}`);
              }
            }
            
            currentStart = booking.end;
            currentStartMinutes = normalizeTime(booking.end);
          }
          
          if (currentStartMinutes < slotEndMinutes) {
            const remainingMinutes = slotEndMinutes - currentStartMinutes;
            if (remainingMinutes >= 30) {
              availableSlots.push(`${currentStart} - ${slotEnd}`);
            }
          }
        }
      }
      
      availableSlots = availableSlots.filter(slot => {
        const [start, end] = slot.split(' - ');
        const startMinutes = normalizeTime(start);
        const endMinutes = normalizeTime(end);
        const duration = endMinutes - startMinutes;
        return duration >= 30;
      });
      
      if (i === 0) {
        availableSlots = availableSlots.filter(slot => {
          const startTimeStr = slot.split(' - ')[0];
          const slotTime = moment.tz(startTimeStr, 'hh:mm A', 'Asia/Kolkata');
          const minBookingTime = currentTime.clone().add(30, 'minutes');
          return slotTime.isSameOrAfter(minBookingTime);
        });
      }
      
      result.push({
        date: dateStr,
        available: availableSlots,
        availableCount: availableSlots.length
      });
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch slot availability",
      error: error.message
    });
  }
};

const convertTimeToMinutes = (timeStr) => {
  let hours, minutes, period;
  
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, modifier] = timeStr.split(' ');
    [hours, minutes] = time.split(':').map(Number);
    period = modifier;
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  } else {
    [hours, minutes] = timeStr.split(':').map(Number);
  }
  
  return hours * 60 + minutes;
};

const offers = async (req, res) => {
  try {
    const currentDate = new Date();
    
    await Offer.updateMany(
      {
        validUntil: { $lt: currentDate },
        isActive: true
      },
      {
        $set: { isActive: false }
      }
    );
    
    const query = {
      isActive: true
    };
    
    const offers = await Offer.find(query)
    .select('-createdAt -updatedAt -__v -maxUses -currentUses')
    .populate('applicableService', 'name')
    .sort({ createdAt: -1 })
    .lean();

    const transformedOffers = offers.map(offer => {
      const { applicableService, ...rest } = offer;
      return {
        ...rest,
        serviceName: applicableService?.name || null
      };
    });
    
    res.status(200).json({
      success: true,
      data: transformedOffers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const bookServices = async (req, res) => {
  try {
    
    const validationError = await validateBookingData(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    
    const user = req.user;
    if (!user.cart || !Array.isArray(user.cart) || user.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Please add services before booking."
      });
    }
    
    for (const item of user.cart) {
      if (!validator.isMongoId(item.service_id?.toString())) {
        return res.status(400).json({
          success: false,
          message: "Invalid service ID format in cart"
        });
      }
      
      if (!validator.isInt(item.numberOfPersons?.toString(), { min: 1, max: 10 })) {
        return res.status(400).json({
          success: false,
          message: "Invalid numberOfPersons in cart. Must be between 1 and 10."
        });
      }
    }
    
    const {
      phoneNumber,
      serviceDate,
      preferredSlotStart,
      homeService,
      locationDetails,
      specialRequest,
      appliedOfferId
    } = req.body;
    
    const parseStartTime = (timeString) => {
      const parsed = new Date(`1970-01-01 ${timeString}`);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Invalid time format: ${timeString}`);
      }
      return { hours: parsed.getHours(), minutes: parsed.getMinutes() };
    };
    
    const { hours: startHours, minutes: startMinutes } = parseStartTime(preferredSlotStart);
    
    const sanitizedPhoneNumber = phoneNumber.toString().replace(/\s/g, '');
    const sanitizedSpecialRequest = specialRequest ? validator.escape(specialRequest.trim()) : '';
    const sanitizedLocationDetails = locationDetails ? validator.escape(locationDetails.trim()) : '';
    const sanitizedPreferredSlotStart = validator.escape(preferredSlotStart.trim());
    
    const serviceItemIds = user.cart.map(item => ({
      serviceItemId: item.service_id,
      numberOfPersons: parseInt(item.numberOfPersons)
    }));
    
    const serviceItemIdStrings = serviceItemIds.map(item => item.serviceItemId.toString());
    
    const serviceItemDetails = await ServiceItem.find({
      _id: { $in: serviceItemIdStrings }
    });
    
    if (serviceItemDetails.length !== serviceItemIdStrings.length) {
      const foundIds = serviceItemDetails.map(item => item._id.toString());
      const missingIds = serviceItemIdStrings.filter(id => !foundIds.includes(id));
      return res.status(400).json({
        success: false,
        message: `Some service items not found: ${missingIds.join(', ')}`
      });
    }
    
    const priceMap = {};
    const cartItemsForOffer = [];
    const serviceItemsWithDuration = [];
    
    let totalDurationMinutes = 0;
    const serviceBreakdown = [];
    
    for (const item of serviceItemIds) {
      const serviceId = item.serviceItemId.toString();
      const serviceDetails = serviceItemDetails.find(s => s._id.toString() === serviceId);
      
      if (!serviceDetails) {
        return res.status(400).json({
          success: false,
          message: `Service item details not found for ID: ${serviceId}`
        });
      }
      
      if (!validator.isFloat(serviceDetails.price?.toString(), { min: 0 })) {
        return res.status(400).json({
          success: false,
          message: `Invalid price for service item: ${serviceId}`
        });
      }
      
      const durationPerPerson = serviceDetails.duration || 30;
      const serviceTotalDuration = durationPerPerson * item.numberOfPersons;
      
      totalDurationMinutes += serviceTotalDuration;
      
      serviceBreakdown.push({
        serviceId: serviceId,
        serviceName: serviceDetails.name,
        numberOfPersons: item.numberOfPersons,
        durationPerPerson: durationPerPerson,
        totalDuration: serviceTotalDuration
      });
      
      serviceItemsWithDuration.push({
        serviceItemId: item.serviceItemId,
        numberOfPersons: item.numberOfPersons,
        calculatedDuration: serviceTotalDuration
      });
      
      priceMap[serviceId] = parseFloat(serviceDetails.price) || 0;
      
      cartItemsForOffer.push({
        service_id: {
          _id: serviceId,
          duration: durationPerPerson
        },
        numberOfPersons: item.numberOfPersons,
        pricePerPerson: priceMap[serviceId]
      });
    }
    
    const BUFFER_TIME_MINUTES = 30;
    const totalTimeWithBuffer = totalDurationMinutes + BUFFER_TIME_MINUTES;
    
    const startDateTime = new Date(`${serviceDate}T${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}:00`);
    const endDateTime = new Date(startDateTime.getTime() + totalTimeWithBuffer * 60000);
    
    const formatTime = (date) => {
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    };
    
    const preferredSlotEnd = formatTime(endDateTime);
    const formattedFullSlot = `${sanitizedPreferredSlotStart} - ${preferredSlotEnd}`;
    
    const endHours = endDateTime.getHours();
    const BUSINESS_HOURS_END = 22;
    
    if (endHours >= BUSINESS_HOURS_END) {
      return res.status(400).json({
        success: false,
        message: `Service completion time (${preferredSlotEnd}) exceeds working hours. Please choose an earlier start time or reduce number of services/persons.`
      });
    }
    
    const serviceMeta = await ServiceMeta.findOne();
    if (!serviceMeta || !serviceMeta.timeSlots || serviceMeta.timeSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No service time slots configured"
      });
    }
    
    const normalizeTime = (timeStr) => {
      let hours, minutes, period;
      const time12HourRegex = /^(0?[0-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
      const time24HourRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
      
      if (time12HourRegex.test(timeStr)) {
        const match = timeStr.match(time12HourRegex);
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
      } else if (time24HourRegex.test(timeStr)) {
        const [h, m] = timeStr.split(':');
        hours = parseInt(h);
        minutes = parseInt(m);
      } else {
        return null;
      }
      
      return hours * 60 + minutes;
    };
    
    const requestedStartMinutes = normalizeTime(sanitizedPreferredSlotStart);
    const requestedEndMinutes = normalizeTime(preferredSlotEnd);
    
    let isWithinOperatingHours = false;
    for (const slot of serviceMeta.timeSlots) {
      const slotStartMinutes = normalizeTime(slot.startTime);
      const slotEndMinutes = normalizeTime(slot.endTime);
      
      if (requestedStartMinutes >= slotStartMinutes && requestedEndMinutes <= slotEndMinutes) {
        isWithinOperatingHours = true;
        break;
      }
    }
    
    if (!isWithinOperatingHours) {
      return res.status(400).json({
        success: false,
        message: `Requested time slot ${sanitizedPreferredSlotStart} - ${preferredSlotEnd} is outside operating hours`
      });
    }
    
    const targetDate = new Date(serviceDate);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const existingBookings = await BookService.find({
      serviceDate: { $gte: targetDate, $lt: nextDay },
      status: { $in: ['pending', 'confirmed'] }
    }).select('preferredSlot');
    
    for (const booking of existingBookings) {
      let bookedStart = null;
      let bookedEnd = null;
      
      if (booking.preferredSlot && booking.preferredSlot.fullSlot) {
        const [start, end] = booking.preferredSlot.fullSlot.split(' - ');
        bookedStart = start.trim();
        bookedEnd = end.trim();
      } else if (typeof booking.preferredSlot === 'string') {
        const [start, end] = booking.preferredSlot.split(' - ');
        bookedStart = start.trim();
        bookedEnd = end.trim();
      }
      
      if (bookedStart && bookedEnd) {
        const bookedStartMinutes = normalizeTime(bookedStart);
        const bookedEndMinutes = normalizeTime(bookedEnd);
        
        if (requestedStartMinutes < bookedEndMinutes && requestedEndMinutes > bookedStartMinutes) {
          return res.status(400).json({
            success: false,
            message: `Time slot ${sanitizedPreferredSlotStart} - ${preferredSlotEnd} conflicts with existing booking ${booking.preferredSlot.fullSlot || booking.preferredSlot}`
          });
        }
      }
    }
    
    const isHomeService = homeService === true || homeService === 'true';
    
    let totalAmount = 0;
    let totalDiscount = 0;
    let appliedOfferData = null;
    
    if (appliedOfferId && appliedOfferId !== '') {
      try {
        const offerResult = await OfferService.applyOfferToCart(
          cartItemsForOffer, 
          req.user._id, 
          appliedOfferId
        );
        
        if (offerResult.success && offerResult.data && offerResult.data.summary) {
          totalAmount = offerResult.data.summary.finalTotal;
          totalDiscount = offerResult.data.summary.discountAmount || 0;
          
          const offer = await Offer.findById(appliedOfferId);
          if (offer) {
            appliedOfferData = {
              offerId: offer._id,
              title: offer.title,
              description: offer.description,
              offerType: offer.offerType,
              discountValue: offer.discountValue,
              discountAmount: totalDiscount
            };
          }
        } else {
          return res.status(400).json({
            success: false,
            message: offerResult.message || "Failed to apply offer"
          });
        }
      } catch (offerError) {
        return res.status(400).json({
          success: false,
          message: offerError.message
        });
      }
    }
    
    if (!appliedOfferData) {
      for (const item of serviceItemIds) {
        const price = priceMap[item.serviceItemId.toString()];
        totalAmount += price * item.numberOfPersons;
      }
    }
    
    if (isNaN(totalAmount)) {
      return res.status(400).json({
        success: false,
        message: "Failed to calculate total amount."
      });
    }
    
    totalAmount = parseFloat(totalAmount.toFixed(2));
    totalDiscount = parseFloat(totalDiscount.toFixed(2));
    
    const booking = await BookService.create({
      fullName: validator.escape(user.fullName),
      userId: user._id,
      phoneNumber: sanitizedPhoneNumber,
      emailId: validator.normalizeEmail(user.emailId),
      serviceDate: new Date(serviceDate),
      preferredSlot: {
        startTime: sanitizedPreferredSlotStart,
        endTime: preferredSlotEnd,
        fullSlot: formattedFullSlot
      },
      durationDetails: {
        totalServiceMinutes: totalDurationMinutes,
        bufferMinutes: BUFFER_TIME_MINUTES,
        totalMinutesWithBuffer: totalTimeWithBuffer
      },
      homeService: isHomeService,
      locationDetails: sanitizedLocationDetails,
      specialRequest: sanitizedSpecialRequest,
      serviceItemIds: serviceItemsWithDuration,
      totalAmount: totalAmount,
      appliedOffer: appliedOfferData,
      bookedDate: new Date(),
      status: "pending"
    });
    
    // Simple offer usage increment
      if (appliedOfferId && appliedOfferId !== '' && appliedOfferData) {
        try {
          const offer = await Offer.findById(appliedOfferId);
          if (offer) {
            await offer.incrementUsage();
          }
        } catch (offerError) {
          console.error('Failed to increment offer usage:', offerError.message);
        }
      }
    
    const populatedBooking = await BookService.findById(booking._id)
      .populate({
        path: "serviceItemIds.serviceItemId",
        select: "name price serviceImage duration"
      })
      .populate({
        path: "appliedOffer.offerId",
        select: "title description offerType discountValue"
      });
    
    const bookingDetails = {
      bookingId: populatedBooking._id,
      fullName: populatedBooking.fullName,
      phoneNumber: populatedBooking.phoneNumber,
      emailId: populatedBooking.emailId,
      serviceDate: populatedBooking.serviceDate,
      preferredSlot: populatedBooking.preferredSlot,
      homeService: populatedBooking.homeService,
      status: populatedBooking.status,
      locationDetails: populatedBooking.locationDetails,
      specialRequest: populatedBooking.specialRequest,
      bookedDate: populatedBooking.bookedDate,
      totalAmount: populatedBooking.totalAmount,
      totalDiscount: populatedBooking.appliedOffer?.discountAmount || 0,
      appliedOffer: populatedBooking.appliedOffer,
      durationDetails: populatedBooking.durationDetails,
      serviceBreakdown: serviceBreakdown,
      serviceItems: populatedBooking.serviceItemIds
        .filter(item => item.serviceItemId !== null)
        .map(item => ({
          _id: item.serviceItemId._id,
          name: validator.escape(item.serviceItemId.name),
          price: item.serviceItemId.price,
          duration: item.serviceItemId.duration,
          serviceImage: item.serviceItemId.serviceImage,
          numberOfPersons: item.numberOfPersons,
          calculatedDuration: item.calculatedDuration,
          subtotal: parseFloat((item.serviceItemId.price * item.numberOfPersons).toFixed(2))
        }))
    };
    
    return res.status(201).json({
      success: true,
      message: "Service booked successfully",
      data: bookingDetails
    });
    
  } catch (error) {
    console.error('Booking error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid data type: ${error.path}`
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};



module.exports = {
  bookServices,
  sendReview,
  getCart,
  removeFromCart,
  getHistory,
  addToCart,
  getReview,
  incrementCart,
  decrementCart,
  getSlotAvailability,
  updateProfile,
  getProfile,
  getAllServices,
  offers,
  applyOfferToCart,
  getAllServiceMeta
};
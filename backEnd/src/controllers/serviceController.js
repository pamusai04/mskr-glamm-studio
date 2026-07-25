const validateCategoryAndItems = require("../utils/validateCategoryAndItems");

const { ServiceCategory, ServiceItem } = require("../models/Service");
const BookService = require('../models/bookService');
const User = require('../models/User');
const Review = require('../models/review');

const { cloudinary } = require("../config/cloudinary");

const handleImageUpload = async (file, existingCloudinaryId = null) => {
  if (!file) {
    return {
      serviceImage: "https://lh3.googleusercontent.com/d/1TIlSRYnGGXkoXk-5FFykksG9jpgd1Bz1",
      cloudinaryId: null
    };
  }

  if (existingCloudinaryId) {
    await cloudinary.uploader.destroy(existingCloudinaryId);
  }

  return {
    serviceImage: file.path,
    cloudinaryId: file.filename
  };
};
const addService = async (req, res) => {
  try {
    
    validateCategoryAndItems(req.body);
    let items = req.body.items;
    if (items && typeof items === 'string') {
      items = JSON.parse(items);
    }

    const { title, type, name, desc, price, originalPrice, categoryId, category, duration } = req.body;

    const numericPrice = price ? Number(price) : undefined;
    const numericOriginalPrice = originalPrice ? Number(originalPrice) : undefined;
    const numericDuration = duration ? Number(duration) : undefined;

    let serviceCategory;

    if (categoryId) {
      serviceCategory = await ServiceCategory.findById(categoryId);
      if (!serviceCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }
    } else {
      serviceCategory = await ServiceCategory.findOne({
        title: title,
        type: type,
        category: category
      });

      if (!serviceCategory) {
        serviceCategory = await ServiceCategory.create({
          title: title,
          type: type,
          category: category || title.toLowerCase()
        });
      }
    }

    const imageData = await handleImageUpload(req.file);
    
    const newService = await ServiceItem.create({
      name,
      desc,
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      duration: numericDuration,
      serviceImage: imageData.serviceImage,
      cloudinaryId: imageData.cloudinaryId,
      categoryId: serviceCategory._id,
      bookCount: 0
    });
    
    const populatedService = await ServiceItem.findById(newService._id)
      .populate('categoryId', 'title type category name');
    
    const responseData = {
      _id: populatedService._id,
      name: populatedService.name,
      desc: populatedService.desc,
      price: populatedService.price,
      originalPrice: populatedService.originalPrice,
      duration: populatedService.duration,
      serviceImage: populatedService.serviceImage,
      cloudinaryId: populatedService.cloudinaryId,
      bookCount: populatedService.bookCount,
      categoryId: populatedService.categoryId._id,
      categoryName: populatedService.categoryId.name || populatedService.categoryId.category,
      categoryTitle: populatedService.categoryId.title,
      categoryType: populatedService.categoryId.type
    };
    
    res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: responseData
    });

  } catch (error) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateService = async (req, res) => {
  try {
    const { _id, name, desc, price, originalPrice, serviceImage, duration, categoryId } = req.body;

    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required"
      });
    }

    const existingService = await ServiceItem.findById(_id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service item not found"
      });
    }

    const updates = {};

    if (name !== undefined) updates.name = name;
    if (desc !== undefined) updates.desc = desc;
    if (price !== undefined) updates.price = Number(price);
    if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
    if (duration !== undefined) updates.duration = Number(duration);
    if (categoryId !== undefined) updates.categoryId = categoryId;
    
    if (req.file) {
      const imageData = await handleImageUpload(req.file, existingService.cloudinaryId);
      updates.serviceImage = imageData.serviceImage;
      updates.cloudinaryId = imageData.cloudinaryId;
    } else if (serviceImage !== undefined) {
      updates.serviceImage = serviceImage;
    }

    const updatedItem = await ServiceItem.findByIdAndUpdate(
      _id,
      updates,
      { returnDocument: "after", runValidators: true }
    );

    const populatedService = await ServiceItem.findById(updatedItem._id)
      .populate('categoryId', 'title type category name');

    const responseData = {
      _id: populatedService._id,
      name: populatedService.name,
      desc: populatedService.desc,
      price: populatedService.price,
      originalPrice: populatedService.originalPrice,
      duration: populatedService.duration,
      serviceImage: populatedService.serviceImage,
      cloudinaryId: populatedService.cloudinaryId,
      bookCount: populatedService.bookCount,
      categoryId: populatedService.categoryId._id,
      categoryName: populatedService.categoryId.name || populatedService.categoryId.category,
      categoryTitle: populatedService.categoryId.title,
      categoryType: populatedService.categoryId.type
    };

    res.status(200).json({
      success: true,
      message: "Service updated successfully!",
      data: responseData
    });

  } catch (error) {
    if (req.file) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteService = async (req, res) => {
  try {
    const { _id } = req.body;
    
    const service = await ServiceItem.findById(_id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    
    if (service.cloudinaryId) {
      await cloudinary.uploader.destroy(service.cloudinaryId);
    }
    
    await ServiceItem.findByIdAndDelete(_id);
    
    res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });

  } catch (error) {
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
        $unwind: "$items"
      },
      {
        $project: {
          _id: "$items._id",
          name: "$items.name",
          desc: "$items.desc",
          price: "$items.price",
          duration : "$items.duration",
          originalPrice: "$items.originalPrice",
          hasActiveOffer: "$items.hasActiveOffer",
          offerExpiryDate: "$items.offerExpiryDate",
          serviceImage: "$items.serviceImage",
          bookCount: "$items.bookCount",
          categoryId: "$_id",
          categoryTitle: "$title",
          categoryType: "$type",
          categoryName: "$category"
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

const getHistory = async (req, res) => {
  try {
    const response = await BookService.find({})
      .populate({
        path: "serviceItemIds.serviceItemId",
        select: "name price serviceImage"
      })
      .populate({
        path: "appliedOffer.offerId",
        select: "title description offerType discountValue"
      })
      .sort({ createdAt: -1 });
      
    const data = response.map(item => {
      const bookingData = {
        booking_id: item._id,
        fullName: item.fullName,
        userId: item.userId,
        status: item.status,
        locationDetails : item.locationDetails,
        phoneNumber: item.phoneNumber,
        serviceDate: item.serviceDate,
        emailId: item.emailId,
        preferredSlot: item.preferredSlot,
        homeService: item.homeService,
        specialRequest: item.specialRequest,
        bookedDate: item.bookedDate,
        totalAmount: item.totalAmount,
        cancellationReason: item.cancellationReason,
        serviceItemIds: item.serviceItemIds
          .filter(i => i.serviceItemId !== null)
          .map(i => ({
            _id: i.serviceItemId._id,
            name: i.serviceItemId.name,
            price: i.serviceItemId.price,
            serviceImage: i.serviceItemId.serviceImage,
            numberOfPersons: i.numberOfPersons
          }))
      };

      if (item.appliedOffer) {
        bookingData.appliedOffer = {
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
        };
      } else {
        bookingData.appliedOffer = null;
      }

      return bookingData;
    });
    
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

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status, reason } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "bookingId and status are required"
      });
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, confirmed, completed, cancelled"
      });
    }

    const booking = await BookService.findById(bookingId).populate({
      path: "serviceItemIds.serviceItemId",
      select: "name price serviceImage"
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const currentStatus = booking.status;

    if (currentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Cannot update status. Booking is already completed"
      });
    }

    if (currentStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "Cannot update status. Booking is already cancelled"
      });
    }

    const allowedTransitions = {
      'pending': {
        allowed: ['confirmed', 'cancelled'],
        message: 'Pending bookings can only be confirmed or cancelled'
      },
      'confirmed': {
        allowed: ['completed', 'cancelled'],
        message: 'Confirmed bookings can only be completed or cancelled'
      },
      'completed': {
        allowed: [],
        message: 'Completed bookings cannot be changed'
      },
      'cancelled': {
        allowed: [],
        message: 'Cancelled bookings cannot be changed'
      }
    };

    if (!allowedTransitions[currentStatus].allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: allowedTransitions[currentStatus].message,
        data: {
          currentStatus,
          requestedStatus: status,
          allowedTransitions: allowedTransitions[currentStatus].allowed
        }
      });
    }

    if (status === 'cancelled' && !reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required when cancelling a booking"
      });
    }

    booking.status = status;
    
    if (status === 'cancelled') {
      booking.cancellationReason = reason;
      booking.cancelledAt = new Date();
    }
    
    if (status === 'confirmed') {
      booking.confirmedAt = new Date();
    }
    
    if (status === 'completed') {
      booking.completedAt = new Date();
    }
    
    await booking.save();

    const responseMessage = status === 'cancelled' 
      ? `Booking cancelled successfully${reason ? `: ${reason}` : ''}`
      : `Booking status updated from ${currentStatus} to ${status} successfully`;

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        bookingId: booking._id,
        userId: booking.userId,
        fullName: booking.fullName,
        status: booking.status,
        previousStatus: currentStatus,
        serviceDate: booking.serviceDate,
        ...(status === 'cancelled' && { cancellationReason: reason }),
        ...(status === 'confirmed' && { confirmedAt: booking.confirmedAt }),
        ...(status === 'completed' && { completedAt: booking.completedAt })
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        const bookings = await BookService.find({ userId: user._id });
        
        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        const totalSpent = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        return {
          _id: user._id,
          fullName: user.fullName,
          emailId: user.emailId,
          phoneNumber: user.contactNumber,
          gender: user.gender,
          role: user.role,
          isActive: user.isActive,
          profilePhoto: user.profilePhoto.url,
          totalBookings: totalBookings,
          completedBookings: completedBookings,
          cancelledBookings: cancelledBookings,
          totalSpent: totalSpent,
          joinedDate: user.createdAt,
          lastActive: user.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('userId', 'fullName emailId profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.body;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "Review ID is required"
      });
    }

    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  addService,
  deleteService,
  getAllServices,
  updateService,
  getHistory,
  updateBookingStatus,
  getAllUsers,
  getReviews,
  deleteReview
};

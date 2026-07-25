const Offer = require("../models/Offer");
const { ServiceItem } = require("../models/Service");
const validateOfferData = require("../utils/validateOfferData");

const createOffer = async (req, res) => {
  try {
    
    const validationError = validateOfferData(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }
    
    const { 
      title, description, offerType, discountValue, applicableService, 
      minAmount, firstTimeUserOnly, validFrom, validUntil, maxUses 
    } = req.body;
    
    // Check if the service exists
    const serviceExists = await ServiceItem.findById(applicableService);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: "Service not found."
      });
    }
    
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);
    
    if (validFrom.length === 10) fromDate.setHours(0, 0, 0, 0);
    if (validUntil.length === 10) untilDate.setHours(23, 59, 59, 999);
    
    const offerData = {
      title: title.trim(),
      description: description.trim(),
      offerType,
      discountValue: Number(discountValue),
      applicableService,
      validFrom: fromDate,
      validUntil: untilDate
    };
    
    if (minAmount !== undefined) offerData.minAmount = Number(minAmount);
    if (firstTimeUserOnly !== undefined) offerData.firstTimeUserOnly = firstTimeUserOnly;
    if (maxUses !== undefined) offerData.maxUses = Number(maxUses);
    
    const offer = await Offer.create(offerData);
    
    const { createdAt, updatedAt, __v, ...data } = offer.toObject();
      
    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getOffers = async (req, res) => {
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
    
    const offers = await Offer.find({})
      .populate('applicableService', 'name price serviceImage')
      .sort({ createdAt: -1 });
    
    const cleanedOffers = offers.map(offer => {
      const offerObj = offer.toObject();
      const { createdAt, updatedAt, __v, ...rest } = offerObj;
      return rest;
    });
    
    res.status(200).json({
      success: true,
      data: cleanedOffers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteOffer = async (req, res) => {
  try {
    const { _id } = req.body;
    
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Offer ID is required"
      });
    }
    
    // Check if the offer exists before deleting
    const offerExists = await Offer.findById(_id);
    if (!offerExists) {
      return res.status(404).json({
        success: false,
        message: "Offer not found"
      });
    }
    
    const offer = await Offer.findByIdAndDelete(_id);
    
    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
      data: {
        _id: offer._id,
        title: offer.title
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOffer,
  getOffers,
  deleteOffer
};

const ServiceMeta = require("../models/serviceMetaSchema");
const User = require("../models/User");
const BookService = require('../models/bookService');
const validateServiceMeta = require("../utils/validateServiceMeta");
const { ServiceItem } = require("../models/Service");
const HeroImage = require("../models/HeroImage");
const QRCode = require("../models/QRCode");


const getLandingPageData = async (req, res) => {
  try {
    const serviceMetadataList = await ServiceMeta.find();
    const totalClientsCount = await User.countDocuments();
    const totalBookingsCount = await BookService.countDocuments();
    const totalServicesCount = await ServiceItem.countDocuments();
    const heroImages = await HeroImage.find();
    const qrCode = await QRCode.findOne();

    if (!serviceMetadataList || serviceMetadataList.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service information not available"
      });
    }

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
    const updatedServiceMetadataList = await ServiceMeta.find();

    const sanitizedMetadata = updatedServiceMetadataList.map(service => {
      const { eventPhotos, gmailId, createdAt, updatedAt, __v, ...serviceInfo } = service.toObject();
      return {
        ...serviceInfo,
        shopClosureDates: service.shopClosureDates || []
      };
    });

    const sanitizedHeroImages = {};
    heroImages.forEach(img => {
      const { publicId, __v, ...sanitizedImg } = img.toObject();
      sanitizedHeroImages[img.nameOfTheImage] = sanitizedImg;
    });
    const qrData = qrCode ? {
        qrImage: qrCode.qrImage,
        cloudinaryId: qrCode.cloudinaryId
      } : null
    const landingPageData = {
      services: sanitizedMetadata,
      statistics: {
        clients: totalClientsCount,
        bookings: totalBookingsCount,
        services: totalServicesCount
      },
      heroImages: sanitizedHeroImages,
      qrCode: qrData
    };
    
    res.status(200).json({
      success: true,
      data: landingPageData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getLandingPageData };
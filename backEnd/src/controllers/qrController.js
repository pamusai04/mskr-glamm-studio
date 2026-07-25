const QRCode = require('../models/QRCode');
const { cloudinary } = require("../config/cloudinary");

const getQR = async (req, res) => {
  try {
    const qr = await QRCode.findOne();
    
    if (!qr) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: qr,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addOrUpdateQR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }
    
    const existingQR = await QRCode.findOne();
    
    if (existingQR) {
      if (existingQR.cloudinaryId) {
        await cloudinary.uploader.destroy(existingQR.cloudinaryId);
      }
      
      existingQR.qrImage = req.file.path;
      existingQR.cloudinaryId = req.file.filename;
      
      await existingQR.save();
      
      return res.status(200).json({
        success: true,
        message: 'QR code updated successfully',
        data: existingQR,
      });
    }
    
    const newQR = new QRCode({
      qrImage: req.file.path,
      cloudinaryId: req.file.filename,
    });
    
    await newQR.save();
    
    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      data: newQR,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getQR,
  addOrUpdateQR,
};
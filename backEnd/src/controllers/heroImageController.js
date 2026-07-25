const HeroImage = require('../models/HeroImage');
const { cloudinary } = require("../config/cloudinary");

const getAllHeroImages = async (req, res) => {
  try {
    const heroImages = await HeroImage.find();
    
    res.status(200).json({
      success: true,
      data: heroImages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createHeroImage = async (req, res) => {
  try {
    const { nameOfTheImage } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }
    
    if (!nameOfTheImage) {
      return res.status(400).json({
        success: false,
        message: 'Name of the image is required',
      });
    }
    
    const heroImage = new HeroImage({
      nameOfTheImage,
      url: req.file.path,
      publicId: req.file.filename,
    });
    
    await heroImage.save();
    
    res.status(201).json({
      success: true,
      message: 'Hero image created successfully',
      data: heroImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateHeroImage = async (req, res) => {
  try {
    const { id, nameOfTheImage } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Image ID is required',
      });
    }
    
    const heroImage = await HeroImage.findById(id);
    if (!heroImage) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found',
      });
    }
    
    if (nameOfTheImage) {
      heroImage.nameOfTheImage = nameOfTheImage;
    }
    
    if (req.file) {
      if (heroImage.publicId) {
        await cloudinary.uploader.destroy(heroImage.publicId);
      }
      
      heroImage.url = req.file.path;
      heroImage.publicId = req.file.filename;
    }
    
    await heroImage.save();
    
    res.status(200).json({
      success: true,
      message: 'Hero image updated successfully',
      data: heroImage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteHeroImage = async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Image ID is required',
      });
    }
    
    const heroImage = await HeroImage.findById(id);
    if (!heroImage) {
      return res.status(404).json({
        success: false,
        message: 'Hero image not found',
      });
    }
    
    if (heroImage.publicId) {
      await cloudinary.uploader.destroy(heroImage.publicId);
    }
    
    await HeroImage.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Hero image deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllHeroImages,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
};
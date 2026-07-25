const EventPhoto = require('../models/EventPhoto');
const { cloudinary } = require("../config/cloudinary");

const handleEventPhotoUpload = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'event-photos',
      resource_type: 'auto'
    });
    return {
      url: result.secure_url,
      cloudinaryId: result.public_id
    };
  } catch (error) {
    throw new Error('Failed to upload image');
  }
};

const getEventPhotos = async (req, res) => {
  try {
    const eventPhotos = await EventPhoto.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: eventPhotos || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const addEventPhoto = async (req, res) => {
  try {
    const { title, category, description, url } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }
    
    if (!req.file && !url) {
      return res.status(400).json({
        success: false,
        message: 'Image file or URL is required',
      });
    }
    
    let photoData = {};
    
    if (req.file) {
      const imageData = await handleEventPhotoUpload(req.file);
      photoData = {
        url: imageData.url,
        cloudinaryId: imageData.cloudinaryId,
        title: title.trim(),
        category: category || 'all',
        description: description || '',
      };
    } else if (url) {
      photoData = {
        url: url,
        cloudinaryId: null,
        title: title.trim(),
        category: category || 'all',
        description: description || '',
      };
    }
    
    const newEventPhoto = new EventPhoto(photoData);
    await newEventPhoto.save();
    
    res.status(201).json({
      success: true,
      message: 'Event photo added successfully',
      data: newEventPhoto,
    });
  } catch (error) {
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEventPhoto = async (req, res) => {
  try {
    const { photoId } = req.body;
    
    if (!photoId) {
      return res.status(400).json({
        success: false,
        message: 'Photo ID is required',
      });
    }
    
    const photo = await EventPhoto.findById(photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Event photo not found',
      });
    }
    
    if (photo.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(photo.cloudinaryId);
      } catch (err) {
        console.error("Error deleting from cloudinary:", err);
      }
    }
    
    await EventPhoto.findByIdAndDelete(photoId);
    
    res.status(200).json({
      success: true,
      message: 'Event photo deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getEventPhotos,
  addEventPhoto,
  deleteEventPhoto,
};
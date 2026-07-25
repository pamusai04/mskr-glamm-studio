
const express = require('express');
const offerRouter = express.Router();

const createRateLimiter = require('../middlewares/apiRateLimiter');
const {
  createOffer,
  deleteOffer,
  getOffers
} = require('../controllers/offerController');
const adminMiddleware = require('../middlewares/adminMiddleware');

offerRouter.post('/offers', adminMiddleware, createRateLimiter(3600, 5), createOffer);
offerRouter.get('/offers', adminMiddleware, createRateLimiter(60, 30), getOffers);
offerRouter.delete('/offers', adminMiddleware, createRateLimiter(3600, 10), deleteOffer);

module.exports = offerRouter;
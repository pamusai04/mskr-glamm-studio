const express = require('express');
const router = express.Router();
const createRateLimiter = require('../middlewares/apiRateLimiter');
const { getLandingPageData } = require('../controllers/landingPageController');

router.get('/landing-data', 
  createRateLimiter(60, 30),
  getLandingPageData
);

module.exports = router;
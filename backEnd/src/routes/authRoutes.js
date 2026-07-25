const express = require('express');
const router = express.Router();
const createRateLimiter = require('../middlewares/apiRateLimiter');
const userMiddleware = require('../middlewares/userMiddleware');

const { register, verifyOTP, resendOTP, login, refreshAccessToken, logout, checkAuth, changePassword,  forgotPassword, resetPassword } = require('../controllers/authController');
router.post('/register', createRateLimiter(900, 5), register);
router.post('/verify-otp', createRateLimiter(300, 5), verifyOTP);
router.post('/resend-otp', createRateLimiter(3600, 3), resendOTP);
router.post('/login', createRateLimiter(900, 10), login);
router.post('/refresh-token', createRateLimiter(60, 5), refreshAccessToken);
router.post('/forgot-password', createRateLimiter(3600, 3), forgotPassword);
router.post('/reset-password', createRateLimiter(900, 5), resetPassword);
router.post('/logout', userMiddleware, logout);
router.get('/check-auth', createRateLimiter(60, 40), userMiddleware, checkAuth );
router.post('/change-password',userMiddleware, createRateLimiter(600, 5), changePassword );

module.exports = router;
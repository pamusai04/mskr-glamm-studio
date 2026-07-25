const express = require("express");
const userRouter = express.Router();
const createRateLimiter = require('../middlewares/apiRateLimiter');
const userMiddleware = require("../middlewares/userMiddleware");

const {
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
} = require("../controllers/userController");

userRouter.get("/getMeta", createRateLimiter(60, 30), userMiddleware, getAllServiceMeta);
userRouter.get("/getServices", createRateLimiter(60, 20), userMiddleware, getAllServices);
userRouter.get("/cart", createRateLimiter(60, 30), userMiddleware, getCart);
userRouter.get("/history", createRateLimiter(60, 15), userMiddleware, getHistory);
userRouter.get("/getReview", createRateLimiter(60, 20), userMiddleware, getReview);
userRouter.get("/profile", createRateLimiter(60, 15), userMiddleware, getProfile);
userRouter.get('/offers', createRateLimiter(60, 20), userMiddleware, offers);
userRouter.get("/slot-availability", createRateLimiter(60, 30), userMiddleware, getSlotAvailability);

userRouter.post("/cart", createRateLimiter(60, 10), userMiddleware, addToCart);
userRouter.delete("/cart", createRateLimiter(60, 15), userMiddleware, removeFromCart);
userRouter.put("/cart/increment", createRateLimiter(60, 20), userMiddleware, incrementCart);
userRouter.put("/cart/decrement", createRateLimiter(60, 20), userMiddleware, decrementCart);

userRouter.post("/book-service", createRateLimiter(300, 5), userMiddleware, bookServices);
userRouter.post("/review", createRateLimiter(3600, 3), userMiddleware, sendReview);
userRouter.post('/apply-offer', createRateLimiter(300, 5), userMiddleware, applyOfferToCart);

userRouter.put("/profile", createRateLimiter(3600, 5), userMiddleware, updateProfile);

module.exports = userRouter;
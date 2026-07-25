const express = require("express");
const qrRouter = express.Router();
const createRateLimiter = require('../middlewares/apiRateLimiter');
const adminMiddleware = require("../middlewares/adminMiddleware");
const { upload } = require("../config/cloudinary");
const { getQR, addOrUpdateQR } = require("../controllers/qrController");

qrRouter.get(
  "/get-qr",
  adminMiddleware,
  createRateLimiter(60, 20),
  getQR
);

qrRouter.post(
  "/add-or-update-qr",
  adminMiddleware,
  createRateLimiter(3600, 10),
  upload.single('qrImage'),
  addOrUpdateQR
);

module.exports = qrRouter;
// const express = require("express");
// const adminRouter = express.Router();

// const createRateLimiter = require('../middlewares/apiRateLimiter');
// const adminMiddleware = require("../middlewares/adminMiddleware");
// const { upload , originalUpload } = require("../config/cloudinary");
 
// const {
//   addService,
//   updateService,
//   deleteService,
//   getAllServices,
//   getHistory,
//   updateBookingStatus,
//   getAllUsers,
//   getReviews,
//   deleteReview
// } = require("../controllers/serviceController");

// const {
//   addServiceMeta,
//   getAllServiceMeta,
//   deleteServiceMetaItem,
//   addShopClosureDate,
//   deleteShopClosureDate
// } = require("../controllers/serviceMetaController");
// const {
//   getAllHeroImages,
//   createHeroImage,
//   updateHeroImage,
//   deleteHeroImage,
// } = require("../controllers/heroImageController");

// const {
//   getEventPhotos,
//   addEventPhoto,
//   deleteEventPhoto,
// } = require("../controllers/eventPhotoController");

// adminRouter.post("/addService", adminMiddleware, createRateLimiter(3600, 10), upload.single('serviceImage'), addService);

// adminRouter.put("/updateService", adminMiddleware, createRateLimiter(3600, 20), upload.single('serviceImage'), updateService);

// adminRouter.delete("/deleteService", adminMiddleware, createRateLimiter(3600, 10), deleteService);

// adminRouter.get("/getServices", createRateLimiter(60, 10), adminMiddleware, getAllServices);

// adminRouter.put('/update-booking-status', adminMiddleware, createRateLimiter(60, 20), updateBookingStatus);

// adminRouter.get("/getHistory", createRateLimiter(60, 20), adminMiddleware, getHistory);

// adminRouter.post("/addMeta", adminMiddleware, createRateLimiter(3600, 5), addServiceMeta);

// adminRouter.delete("/deleteMeta", adminMiddleware, createRateLimiter(3600, 10), deleteServiceMetaItem);

// adminRouter.get("/getMeta", createRateLimiter(60, 30), adminMiddleware, getAllServiceMeta);

// adminRouter.post("/shop-closure", adminMiddleware, createRateLimiter(3600, 10), addShopClosureDate);

// adminRouter.delete("/shop-closure", adminMiddleware, createRateLimiter(3600, 10), deleteShopClosureDate);

// adminRouter.get("/getUsers", createRateLimiter(60, 15), adminMiddleware, getAllUsers);

// adminRouter.get("/getReviews", createRateLimiter(60, 20), adminMiddleware, getReviews);

// adminRouter.delete("/deleteReview", adminMiddleware, createRateLimiter(3600, 20), deleteReview);

// adminRouter.get("/hero-images", adminMiddleware, createRateLimiter(60, 10), getAllHeroImages );

// adminRouter.post("/hero-images", adminMiddleware, createRateLimiter(3600, 10), originalUpload.single('image'),createHeroImage );

// adminRouter.put("/hero-images", adminMiddleware, createRateLimiter(3600, 20), originalUpload.single('image'), updateHeroImage );

// adminRouter.delete("/hero-images", adminMiddleware, createRateLimiter(3600, 20), deleteHeroImage );


// adminRouter.get(
//   "/get-event-photos",
//   createRateLimiter(60, 20),
//   getEventPhotos
// );

// adminRouter.post(
//   "/add-event-photo",
//   adminMiddleware,
//   createRateLimiter(3600, 10),
//   upload.single('image'),
//   addEventPhoto
// );

// adminRouter.delete(
//   "/delete-event-photo",
//   adminMiddleware,
//   createRateLimiter(3600, 10),
//   deleteEventPhoto
// );


// module.exports = adminRouter;


const express = require("express");
const adminRouter = express.Router();
const createRateLimiter = require('../middlewares/apiRateLimiter');
const adminMiddleware = require("../middlewares/adminMiddleware");
const { upload, originalUpload } = require("../config/cloudinary");

const {
  addService,
  updateService,
  deleteService,
  getAllServices,
  getHistory,
  updateBookingStatus,
  getAllUsers,
  getReviews,
  deleteReview
} = require("../controllers/serviceController");

const {
  addServiceMeta,
  getAllServiceMeta,
  deleteServiceMetaItem,
  addShopClosureDate,
  deleteShopClosureDate
} = require("../controllers/serviceMetaController");

const {
  getAllHeroImages,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
} = require("../controllers/heroImageController");

const {
  getEventPhotos,
  addEventPhoto,
  deleteEventPhoto,
} = require("../controllers/eventPhotoController");

// ==================== SERVICE ROUTES ====================
adminRouter.post(
  "/addService",
  adminMiddleware,
  createRateLimiter(3600, 10),
  upload.single('serviceImage'),
  addService
);

adminRouter.put(
  "/updateService",
  adminMiddleware,
  createRateLimiter(3600, 10),
  upload.single('serviceImage'),
  updateService
);

adminRouter.delete(
  "/deleteService",
  adminMiddleware,
  createRateLimiter(3600, 10),
  deleteService
);

adminRouter.get(
  "/getServices",
  adminMiddleware,
  createRateLimiter(60, 10),
  getAllServices
);

// ==================== SERVICE META ROUTES ====================
adminRouter.post(
  "/addMeta",
  adminMiddleware,
  createRateLimiter(3600, 5),
  addServiceMeta
);

adminRouter.delete(
  "/deleteMeta",
  adminMiddleware,
  createRateLimiter(3600, 10),
  deleteServiceMetaItem
);

adminRouter.get(
  "/getMeta",
  adminMiddleware,
  createRateLimiter(60, 30),
  getAllServiceMeta
);

adminRouter.post(
  "/shop-closure",
  adminMiddleware,
  createRateLimiter(3600, 10),
  addShopClosureDate
);

adminRouter.delete(
  "/shop-closure",
  adminMiddleware,
  createRateLimiter(3600, 10),
  deleteShopClosureDate
);

// ==================== EVENT PHOTO ROUTES ====================
adminRouter.get(
  "/get-event-photos",
  createRateLimiter(60, 20),
  getEventPhotos
);

adminRouter.post(
  "/add-event-photo",
  adminMiddleware,
  createRateLimiter(3600, 10),
  upload.single('image'),
  addEventPhoto
);

adminRouter.delete(
  "/delete-event-photo",
  adminMiddleware,
  createRateLimiter(3600, 10),
  deleteEventPhoto
);

// ==================== HERO IMAGE ROUTES ====================
adminRouter.get(
  "/hero-images",
  adminMiddleware,
  createRateLimiter(60, 10),
  getAllHeroImages
);

adminRouter.post(
  "/hero-images",
  adminMiddleware,
  createRateLimiter(3600, 10),
  originalUpload.single('image'),
  createHeroImage
);

adminRouter.put(
  "/hero-images",
  adminMiddleware,
  createRateLimiter(3600, 20),
  originalUpload.single('image'),
  updateHeroImage
);

adminRouter.delete(
  "/hero-images",
  adminMiddleware,
  createRateLimiter(3600, 20),
  deleteHeroImage
);

// ==================== USER & BOOKING ROUTES ====================
adminRouter.put(
  '/update-booking-status',
  adminMiddleware,
  createRateLimiter(60, 20),
  updateBookingStatus
);

adminRouter.get(
  "/getHistory",
  adminMiddleware,
  createRateLimiter(60, 20),
  getHistory
);

adminRouter.get(
  "/getUsers",
  adminMiddleware,
  createRateLimiter(60, 15),
  getAllUsers
);

// ==================== REVIEW ROUTES ====================
adminRouter.get(
  "/getReviews",
  adminMiddleware,
  createRateLimiter(60, 20),
  getReviews
);

adminRouter.delete(
  "/deleteReview",
  adminMiddleware,
  createRateLimiter(3600, 20),
  deleteReview
);

module.exports = adminRouter;
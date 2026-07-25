import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import cartReducer from "./slices/cartSlice";
import servicesReducer from "./slices/servicesSlice";
import bookingReducer from './slices/bookingSlice';
import metaReducer from "./slices/metaSlice";
import reviewReducer from "./slices/reviewSlice";
import adminServiceReducer from "./slices/adminServiceSlice";
import adminBookingsReducer from './slices/adminBookingSlice';
import adminUsersReducer from './slices/adminUsersSlice';
import adminReviewReducer from './slices/adminReviewSlice';
import offerReducer from './slices/offerSlice';
import landingPageReducer from './slices/landingPageSlice';
import heroImagesReducer from './slices/heroImagesSlice';
import userOfferReducer from "./slices/userOfferSlice";
import qrReducer from "./slices/qrSlice";
import eventPhotosReducer from "./slices/eventPhotosSlice";
import serviceMetaReducer from "./slices/serviceMetaSlice";

export const RESET_STATE = 'RESET_STATE';

const combinedReducers = combineReducers({
  services: servicesReducer,
  cart: cartReducer,
  user: userReducer,
  booking: bookingReducer,
  meta: metaReducer,
  review: reviewReducer,
  adminServices: adminServiceReducer,
  adminBookings: adminBookingsReducer,
  adminUsers: adminUsersReducer,
  adminReviews: adminReviewReducer,
  offers: offerReducer,
  landingPage: landingPageReducer,
  heroImages: heroImagesReducer,
  userOffers: userOfferReducer,
  qr: qrReducer,
  eventPhotos: eventPhotosReducer,
  serviceMeta: serviceMetaReducer,
});

const rootReducer = (state, action) => {
  if (action.type === RESET_STATE) {
    const { landingPage } = state || {};
    
    const newState = {
      landingPage: landingPage
    };
    
    return combinedReducers(newState, action);
  }
  
  return combinedReducers(state, action);
};


export default rootReducer;
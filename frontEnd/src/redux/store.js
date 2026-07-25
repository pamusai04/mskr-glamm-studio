
// import { configureStore } from "@reduxjs/toolkit";
// import userReducer from "./slices/userSlice";
// import cartReducer from "./slices/cartSlice";
// import servicesReducer from "./slices/servicesSlice";
// import bookingReducer from './slices/bookingSlice';
// import metaReducer from "./slices/metaSlice";
// import reviewReducer from "./slices/reviewSlice";
// import adminServiceReducer from "./slices/adminServiceSlice";
// import adminBookingsReducer from './slices/adminBookingSlice';
// import adminUsersReducer from './slices/adminUsersSlice';
// import adminReviewReducer from './slices/adminReviewSlice';
// import offerReducer from './slices/offerSlice';
// import landingPageReducer from './slices/landingPageSlice';
// import heroImagesReducer from './slices/heroImagesSlice';


// export const store = configureStore({
//   reducer: {
//     services: servicesReducer,
//     cart: cartReducer,
//     user: userReducer,
//     booking: bookingReducer,
//     meta: metaReducer,
//     review: reviewReducer,
//     adminServices: adminServiceReducer,
//     adminBookings: adminBookingsReducer,
//     adminUsers: adminUsersReducer,
//     adminReviews: adminReviewReducer,
//     offers: offerReducer,
//     landingPage: landingPageReducer,
//     heroImages: heroImagesReducer,
//   },
// });


// store.js
import { configureStore } from "@reduxjs/toolkit";
import rootReducer, { RESET_STATE } from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
});

export const resetReduxState = () => ({
  type: RESET_STATE,
});
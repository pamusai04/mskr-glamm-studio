import { useEffect, useMemo, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { checkAuth } from './redux/slices/userSlice';
import { fetchServiceMeta } from './redux/slices/serviceMetaSlice';
import { getCart } from './redux/slices/cartSlice';
import { fetchLandingPageData } from './redux/slices/landingPageSlice';

import LandingPage from "./pages/landing/LandingPage";
import Home from "./pages/home/HomePage";
import About from "./pages/about/About";
import Contact from "./pages/contact/ContactPage";
import Services from "./pages/service/ServicesPage";
import Cart from './pages/cart/CartPage';
import BookingPage from './pages/booking/BookingPage';
import BookingHistoryPage from './pages/booking/BookingHistoryPage';
import Reviewform from './pages/reviews/ReviewForm';
import ReviewsPage from "./pages/reviews/ReviewsPage";
import Login from "./pages/auth/Login";
import Register from './pages/auth/Register';
import Gallery from './pages/gallery/GalleryPage';
import Navbar from './components/Navbar';
import UserProfile from './pages/profile/UserProfilePage';
import LoadingAnimation from './components/LoadingAnimation';
import AdminPanel from './pages/admin/AdminPanel';
import AddServicePage from './pages/admin/AddServicePage';
import EditServicePage from './pages/admin/EditServicePage';
import AdminAnalyticsPage from './pages/admin/AdminAnalytics';
import CreateOfferPage from './components/admin/offers/CreateOfferPage';
import AddHeroImagePage from './pages/admin/AddHeroImagePage';
import EditHeroImagePage from './pages/admin/EditHeroImagePage';

import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import TermsPage from './components/legal/TermsPage';
import PrivacyPage from './components/legal/PrivacyPage';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const hasFetchedMeta = useRef(false);
  const hasFetchedCart = useRef(false);
  const hasFetchedLandingData = useRef(false);

  const { loading, isAuthenticated, user } = useSelector((state) => state.user);
  const { fetched: metaFetched, loading: metaLoading } = useSelector((state) => state.meta);
  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { loading: landingLoading } = useSelector((state) => state.landingPage);

  const hideNavbarRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password', '/terms', '/privacy'];
  const isLandingPage = location.pathname === '/';
  const hideNavbar = hideNavbarRoutes.includes(location.pathname) || isLandingPage;

  const toasterConfig = useMemo(() => ({
    position: "top-center",
    toastOptions: {
      duration: 4000,
      style: {
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500',
      },
      success: {
        style: {
          background: '#10B981',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10B981',
        },
      },
      error: {
        style: {
          background: '#EF4444',
          color: '#fff',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      },
      loading: {
        style: {
          background: '#3B82F6',
          color: '#fff',
        },
      },
    },
  }), []);

  const isAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    const checkAuthStatus = async () => {
      await dispatch(checkAuth());
      setAuthChecked(true);
    };
    checkAuthStatus();
  }, [dispatch]);

  useEffect(() => {
    if (!hasFetchedLandingData.current && !landingLoading && authChecked) {
      hasFetchedLandingData.current = true;
      dispatch(fetchLandingPageData());
    }
  }, [dispatch, landingLoading, authChecked]);

  useEffect(() => {
    if (!hasFetchedMeta.current && !metaFetched && !metaLoading && !loading && isAuthenticated && authChecked) {
      hasFetchedMeta.current = true;
      dispatch(fetchServiceMeta());
    }
  }, [dispatch, metaFetched, metaLoading, loading, isAuthenticated, authChecked]);

  useEffect(() => {
    if (!hasFetchedCart.current && isAuthenticated && !cartLoading && (!cart || cart.length === 0) && authChecked) {
      hasFetchedCart.current = true;
      dispatch(getCart());
    }
  }, [dispatch, isAuthenticated, cartLoading, cart, authChecked]);

  if (!authChecked || (loading && !isAuthPage)) {
    return <LoadingAnimation />;
  }

  const isAdmin = user?.role === 'MadhuriShivaKumar';
  const isRegularUser = user?.role === 'user';

  return (
    <>
      <Toaster {...toasterConfig} />

      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/home" element={
          isAuthenticated && isRegularUser ? <Home /> : <Navigate to="/login" replace />
        } />

        <Route path="/about" element={
          isAuthenticated && isRegularUser ? <About /> : <Navigate to="/login" replace />
        } />

        <Route path="/contact" element={
          isAuthenticated && isRegularUser ? <Contact /> : <Navigate to="/login" replace />
        } />

        <Route path="/services" element={
          isAuthenticated && isRegularUser ? <Services /> : <Navigate to="/login" replace />
        } />

        <Route path="/gallery" element={
          isAuthenticated && isRegularUser ? <Gallery /> : <Navigate to="/login" replace />
        } />

        <Route path="/cart" element={
          isAuthenticated && isRegularUser ? <Cart /> : <Navigate to="/login" replace />
        } />

        <Route path="/booking" element={
          isAuthenticated && isRegularUser ? <BookingPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/booking-history" element={
          isAuthenticated && isRegularUser ? <BookingHistoryPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/write-review" element={
          isAuthenticated && isRegularUser ? <Reviewform /> : <Navigate to="/login" replace />
        } />

        <Route path="/reviews" element={
          isAuthenticated && isRegularUser ? <ReviewsPage /> : <Navigate to="/login" replace />
        } />

        <Route path="/profile" element={
          isAuthenticated && (isRegularUser || isAdmin) ? <UserProfile /> : <Navigate to="/login" replace />
        } />

        <Route path="/admin" element={
          isAuthenticated && isAdmin ? <AdminPanel /> : <Navigate to="/" replace />
        } />

        <Route path="/admin/add-service" element={
          isAuthenticated && isAdmin ? <AddServicePage /> : <Navigate to="/" replace />
        } />

        <Route path="/admin/new-offer" element={
          isAuthenticated && isAdmin ? <CreateOfferPage /> : <Navigate to="/" replace />
        } />

        <Route path="/admin/edit-service/:id" element={
          isAuthenticated && isAdmin ? <EditServicePage /> : <Navigate to="/" replace />
        } />

        <Route path="/admin/analytics" element={
          isAuthenticated && isAdmin ? <AdminAnalyticsPage /> : <Navigate to="/" replace />
        } />

        <Route path="/admin/add-hero-image" element={
          isAuthenticated && isAdmin ? <AddHeroImagePage /> : <Navigate to="/" replace />
        } />

        <Route path="/admin/edit-hero-image/:id" element={
          isAuthenticated && isAdmin ? <EditHeroImagePage /> : <Navigate to="/" replace />
        } />

        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
      </Routes>
    </>
  );
}

export default App;

// import { useEffect, useMemo, useRef } from 'react';
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from 'react-redux';
// import { Toaster } from 'react-hot-toast';
// import { checkAuth } from './redux/slices/userSlice';
// import { fetchMeta } from './redux/slices/metaSlice';
// import { getCart } from './redux/slices/cartSlice';
// import { fetchLandingPageData } from './redux/slices/landingPageSlice';

// import LandingPage from "./pages/landing/LandingPage";
// import Home from "./pages/home/HomePage";
// import About from "./pages/about/About";
// import Contact from "./pages/contact/ContactPage";
// import Services from "./pages/service/ServicesPage";
// import Cart from './pages/cart/CartPage';
// import BookingPage from './pages/booking/BookingPage';
// import BookingHistoryPage from './pages/booking/BookingHistoryPage';
// import Reviewform from './pages/reviews/ReviewForm';
// import ReviewsPage from "./pages/reviews/ReviewsPage";
// import Login from "./pages/auth/Login";
// import Register from './pages/auth/Register';
// import Gallery from './pages/gallery/GalleryPage';
// import Navbar from './components/Navbar';
// import UserProfile from './pages/profile/UserProfilePage';
// import LoadingAnimation from './components/LoadingAnimation';
// import AdminPanel from './pages/admin/AdminPanel';
// import AddServicePage from './pages/admin/AddServicePage';
// import EditServicePage from './pages/admin/EditServicePage';
// import AdminAnalyticsPage from './pages/admin/AdminAnalytics';
// import CreateOfferPage from './components/admin/offers/CreateOfferPage';
// import AddHeroImagePage from './pages/admin/AddHeroImagePage';
// import EditHeroImagePage from './pages/admin/EditHeroImagePage';

// import VerifyOTP from './pages/auth/VerifyOTP';
// import ForgotPassword from './pages/auth/ForgotPassword';
// import TermsPage from './components/legal/TermsPage';
// import PrivacyPage from './components/legal/PrivacyPage';

// function App() {
//   const dispatch = useDispatch();
//   const location = useLocation();
//   const hasFetchedAuth = useRef(false);
//   const hasFetchedMeta = useRef(false);
//   const hasFetchedCart = useRef(false);
//   const hasFetchedLandingData = useRef(false);

//   const { loading, isAuthenticated, user } = useSelector((state) => state.user);
//   const { fetched: metaFetched, loading: metaLoading } = useSelector((state) => state.meta);
//   const { cart, loading: cartLoading } = useSelector((state) => state.cart);
//   const { loading: landingLoading } = useSelector((state) => state.landingPage);

//   const hideNavbarRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password', '/terms', '/privacy'];
//   const isLandingPage = location.pathname === '/';
//   const hideNavbar = hideNavbarRoutes.includes(location.pathname) || isLandingPage;

//   const toasterConfig = useMemo(() => ({
//     position: "top-center",
//     toastOptions: {
//       duration: 4000,
//       style: {
//         borderRadius: '12px',
//         padding: '16px',
//         fontSize: '14px',
//         fontWeight: '500',
//       },
//       success: {
//         style: {
//           background: '#10B981',
//           color: '#fff',
//         },
//         iconTheme: {
//           primary: '#fff',
//           secondary: '#10B981',
//         },
//       },
//       error: {
//         style: {
//           background: '#EF4444',
//           color: '#fff',
//         },
//         iconTheme: {
//           primary: '#fff',
//           secondary: '#EF4444',
//         },
//       },
//       loading: {
//         style: {
//           background: '#3B82F6',
//           color: '#fff',
//         },
//       },
//     },
//   }), []);

//   useEffect(() => {
//     if (!hasFetchedLandingData.current && !landingLoading) {
//       hasFetchedLandingData.current = true;
//       dispatch(fetchLandingPageData());
//     }
//   }, [dispatch, landingLoading]);

//   const isAuthPage = ['/login', '/register', '/verify-otp', '/forgot-password'].includes(location.pathname);

//   useEffect(() => {
//     if (!hasFetchedAuth.current && !isAuthPage) {
//       hasFetchedAuth.current = true;
//       dispatch(checkAuth());
//     }
//   }, [dispatch, isAuthPage]);

//   useEffect(() => {
//     if (!hasFetchedMeta.current && !metaFetched && !metaLoading && !loading && isAuthenticated) {
//       hasFetchedMeta.current = true;
//       dispatch(fetchMeta());
//     }
//   }, [dispatch, metaFetched, metaLoading, loading, isAuthenticated]);

//   useEffect(() => {
//     if (!hasFetchedCart.current && isAuthenticated && !cartLoading && (!cart || cart.length === 0)) {
//       hasFetchedCart.current = true;
//       dispatch(getCart());
//     }
//   }, [dispatch, isAuthenticated, cartLoading, cart]);

//   if (loading && !isAuthPage) {
//     return <LoadingAnimation />;
//   }

//   const isAdmin = user?.role === 'MadhuriShivaKumar';
//   const isRegularUser = user?.role === 'user';

//   return (
//     <>
//       <Toaster {...toasterConfig} />

//       {!hideNavbar && <Navbar />}

//       <Routes>
//         <Route path="/" element={<LandingPage />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/verify-otp" element={<VerifyOTP />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
        
//         <Route path="/terms" element={<TermsPage />} />
//         <Route path="/privacy" element={<PrivacyPage />} />

//         <Route path="/home" element={
//           isAuthenticated && isRegularUser ? <Home /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/about" element={
//           isAuthenticated && isRegularUser ? <About /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/contact" element={
//           isAuthenticated && isRegularUser ? <Contact /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/services" element={
//           isAuthenticated && isRegularUser ? <Services /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/gallery" element={
//           isAuthenticated && isRegularUser ? <Gallery /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/cart" element={
//           isAuthenticated && isRegularUser ? <Cart /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/booking" element={
//           isAuthenticated && isRegularUser ? <BookingPage /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/booking-history" element={
//           isAuthenticated && isRegularUser ? <BookingHistoryPage /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/write-review" element={
//           isAuthenticated && isRegularUser ? <Reviewform /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/reviews" element={
//           isAuthenticated && isRegularUser ? <ReviewsPage /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/profile" element={
//           isAuthenticated && (isRegularUser || isAdmin) ? <UserProfile /> : <Navigate to="/login" replace />
//         } />

//         <Route path="/admin" element={
//           isAuthenticated && isAdmin ? <AdminPanel /> : <Navigate to="/" replace />
//         } />

//         <Route path="/admin/add-service" element={
//           isAuthenticated && isAdmin ? <AddServicePage /> : <Navigate to="/" replace />
//         } />

//         <Route path="/admin/new-offer" element={
//           isAuthenticated && isAdmin ? <CreateOfferPage /> : <Navigate to="/" replace />
//         } />

//         <Route path="/admin/edit-service/:id" element={
//           isAuthenticated && isAdmin ? <EditServicePage /> : <Navigate to="/" replace />
//         } />

//         <Route path="/admin/analytics" element={
//           isAuthenticated && isAdmin ? <AdminAnalyticsPage /> : <Navigate to="/" replace />
//         } />

//         <Route path="/admin/add-hero-image" element={
//           isAuthenticated && isAdmin ? <AddHeroImagePage /> : <Navigate to="/" replace />
//         } />

//         <Route path="/admin/edit-hero-image/:id" element={
//           isAuthenticated && isAdmin ? <EditHeroImagePage /> : <Navigate to="/" replace />
//         } />

//         <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/login"} replace />} />
//       </Routes>
//     </>
//   );
// }

// export default App;


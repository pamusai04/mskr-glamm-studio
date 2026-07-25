import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { clearBookingState } from '../../redux/slices/bookingSlice';
import { useCart } from '../../components/user/cart/useCart';
import { BookingForm, OrderSummary } from '../../components/user/bookings';

const BookingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const bookingContainerRef = useRef(null);
  const hasScrolled = useRef(false);
  
  const { cart, loading: cartLoading } = useCart();
  const { loading: bookingLoading, success, error: bookingError, currentBooking } = useSelector((state) => state.booking);
  const { serviceMeta } = useSelector((state) => state.serviceMeta);
  const phoneNumber = serviceMeta?.phoneNumber || "+91 9133293876";
  
  useEffect(() => {
    if ((!cart || cart.length === 0) && !cartLoading) {
      navigate('/cart', { 
        state: { message: 'Your cart is empty. Please add services before booking.' }
      });
    }
  }, [cart, cartLoading, navigate]);
  
  useEffect(() => {
    if (success && currentBooking) {
      const timer = setTimeout(() => {
        dispatch(clearBookingState());
        navigate('/booking-success', { state: { booking: currentBooking } });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, currentBooking, dispatch, navigate]);
  
  useEffect(() => {
    if (!hasScrolled.current && bookingContainerRef.current && !cartLoading && cart && cart.length > 0) {
      hasScrolled.current = true;
      setTimeout(() => {
        const navbarHeight = 80;
        const elementPosition = bookingContainerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight + 16;
        
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }, 150);
    }
  }, [cartLoading, cart]);
  
  if (cartLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-3 text-xs sm:text-sm text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  if (!cart || cart.length === 0) return null;
  
  const cleanPhoneNumber = phoneNumber.replace(/\s/g, '');
  
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div ref={bookingContainerRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 md:pt-16 pb-6 sm:pb-8 md:pb-10">
        <div className="mb-4 sm:mb-6 bg-orange-50 border border-orange-200 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 rounded-full p-2 shrink-0">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-orange-800 text-sm sm:text-base flex items-center gap-2">
                Call Before Booking
              </p>
              <p className="text-xs sm:text-sm text-orange-700 mt-1">
                Please contact us directly for any payment-related queries before booking.
              </p>
              <a 
                href={`tel:${cleanPhoneNumber}`} 
                className="inline-flex items-center gap-2 mt-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-medium"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {phoneNumber}
              </a>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-1 lg:order-last">
            <OrderSummary />
          </div>
          
          <div className="lg:col-span-2 lg:order-first">
            <BookingForm />
            
            {bookingError && !bookingLoading && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 font-medium text-sm">Booking Failed</p>
                  <p className="text-red-600 text-xs">{bookingError}</p>
                </div>
              </div>
            )}
            
            {success && !bookingLoading && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-700 font-medium text-sm">Booking Confirmed!</p>
                  <p className="text-green-600 text-xs">Redirecting to confirmation page...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
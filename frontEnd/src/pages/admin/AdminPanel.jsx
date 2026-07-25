import { useSelector } from 'react-redux';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import AdminCards from '../../components/admin/dashboard/AdminCards';
import ServicesSection from '../../components/admin/services/ServicesSection';
import ManageBookings from '../../components/admin/bookings/ManageBookings';
import UsersSection from '../../components/admin/users/UsersSection';
import ReviewsSection from '../../components/admin/reviews/ReviewsSection';
import LocationSection from '../../components/admin/location/LocationSection';
import TimeSlotsSection from '../../components/admin/timeslots/TimeSlotsSection';
import ContactSection from '../../components/admin/contact/ContactSection';
import PhotosSection from '../../components/admin/photos/PhotosSection';
import OfferSection from '../../components/admin/offers/OfferSection';
import { clearSuccess, fetchAllServices } from '../../redux/slices/adminServiceSlice';
import toast from 'react-hot-toast';
import HeroImagesSection from '../../components/admin/heroImages/HeroImagesSection';
import ShopClosureSection from '../../components/admin/shopClosure/ShopClosureSection';
import QRSection from '../../components/admin/qr/QRSection';


const AdminPanel = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { services, loading, error, success, message } = useSelector((state) => state.adminServices);
  const [activeSection, setActiveSection] = useState('services');
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Only fetch services if they don't exist in Redux state
  useEffect(() => {
    if (!loading && !error && services.length === 0 && !initialFetchDone) {
      dispatch(fetchAllServices());
      setInitialFetchDone(true);
    }
  }, [dispatch, loading, error, services.length, initialFetchDone]);

  // Handle success messages
  // useEffect(() => {
  //   if (success && message) {
  //     toast.success(message);
  //     setTimeout(() => {
  //       dispatch(clearSuccess());
  //     }, 3000);
  //   }
  // }, [success, message, dispatch]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-2 sm:px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-800">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.fullName}</p>
        </div>

        <AdminCards activeSection={activeSection} setActiveSection={setActiveSection} />

        <div className="bg-white rounded-lg shadow-lg p-1 sm:p-6 mb-12">
          {activeSection === 'services' && <ServicesSection />}
          {activeSection === 'bookings' && <ManageBookings />}
          {activeSection === 'users' && <UsersSection />}
          {activeSection === 'reviews' && <ReviewsSection />}
          {activeSection === 'offers' && <OfferSection />}
          {activeSection === 'location' && <LocationSection />}
          {activeSection === 'timeslots' && <TimeSlotsSection />}
          {activeSection === 'contact' && <ContactSection />}
          {activeSection === 'photos' && <PhotosSection />}
          {activeSection === 'heroImages' && <HeroImagesSection/>}
          {activeSection === 'shopclosure' && <ShopClosureSection />}
          {activeSection === 'qr' && <QRSection />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
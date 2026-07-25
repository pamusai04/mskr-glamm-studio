
import { Package, Calendar, Users, Star, MapPin, Clock, Phone, Mail, Image, Gift } from 'lucide-react';
import { useSelector } from 'react-redux';

const AdminCards = ({ activeSection, setActiveSection }) => {
  const { meta } = useSelector((state) => state.meta);
  const { offers } = useSelector((state) => state.offers);
  
  const locationInfo = meta?.location || {};
  const timeSlotsCount = meta?.timeSlots?.length || 0;
  const eventPhotosCount = meta?.eventPhotos?.length || 0;
  const offersCount = offers?.length || 0;
  
  const cards = [
    {
      id: 'services',
      icon: Package,
      title: 'Manage Services',
      description: 'Add, edit or remove services',
      color: 'purple',
      activeColor: 'bg-purple-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-purple-800 hover:bg-purple-50'
    },
    {
      id: 'bookings',
      icon: Calendar,
      title: 'Manage Bookings',
      description: 'View and update booking status',
      color: 'cyan',
      activeColor: 'bg-cyan-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-cyan-800 hover:bg-cyan-50'
    },
    {
      id: 'users',
      icon: Users,
      title: 'Manage Users',
      description: 'View and manage all users',
      color: 'emerald',
      activeColor: 'bg-emerald-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-emerald-800 hover:bg-emerald-50'
    },
    {
      id: 'reviews',
      icon: Star,
      title: 'Manage Reviews',
      description: 'View and moderate reviews',
      color: 'amber',
      activeColor: 'bg-amber-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-amber-800 hover:bg-amber-50'
    },
    {
      id: 'offers',
      icon: Gift,
      title: 'Manage Offers',
      description: `${offersCount} Active Offers`,
      subDescription: 'Create and manage discounts',
      color: 'pink',
      activeColor: 'bg-pink-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-pink-800 hover:bg-pink-50'
    },
    {
      id: 'timeslots',
      icon: Clock,
      title: 'Time Slots',
      description: `${timeSlotsCount} Available Slots`,
      subDescription: 'Manage working hours',
      color: 'indigo',
      activeColor: 'bg-indigo-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-indigo-800 hover:bg-indigo-50'
    },
    {
      id: 'shopclosure',
      icon: Calendar,
      title: 'Shop Closure',
      description: 'Manage closure dates',
      subDescription: 'Set holidays & special closures',
      color: 'red',
      activeColor: 'bg-red-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-red-800 hover:bg-red-50'
    },
    {
      id: 'contact',
      icon: Phone,
      title: 'Contact Info',
      description: meta?.phoneNumber || 'Phone Number',
      subDescription: meta?.gmailId || 'Email',
      color: 'teal',
      activeColor: 'bg-teal-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-teal-800 hover:bg-teal-50'
    },
    {
      id: 'photos',
      icon: Image,
      title: 'Event Photos',
      description: `${eventPhotosCount} Total Photos`,
      subDescription: 'Manage gallery',
      color: 'orange',
      activeColor: 'bg-orange-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-orange-800 hover:bg-orange-50'
    },
    
    {
      id: 'location',
      icon: MapPin,
      title: 'Location Info',
      description: locationInfo.address || 'Studio Address',
      subDescription: `${locationInfo.lat || 'Lat'}, ${locationInfo.lng || 'Lng'}`,
      color: 'blue',
      activeColor: 'bg-blue-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-blue-800 hover:bg-blue-50'
    },
    {
      id: 'heroImages',
      icon: Image,
      title: 'Hero Images',
      description: 'Manage landing page images',
      subDescription: 'Update home and about section images',
      color: 'rose',
      activeColor: 'bg-rose-600 text-white shadow-lg',
      inactiveColor: 'bg-white text-rose-800 hover:bg-rose-50'
    },
    {
      id: 'qr',
      icon: Image,
      title: 'QR Code',
      description: 'Manage QR code',
      subDescription: 'Upload or update QR image',
      color: 'gray',
      activeColor: 'bg-gray-900 text-white shadow-lg',
      inactiveColor: 'bg-white text-gray-800 hover:bg-gray-50'
    }
  ];

  return (
    <div className="mb-6 p-2 sm:mb-8 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 sm:gap-4 pb-3 sm:pb-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setActiveSection(card.id)}
            className={`shrink-0 w-56 sm:w-64 p-4 sm:p-6 rounded-lg transition-all transform hover:scale-105 ${
              activeSection === card.id ? card.activeColor : card.inactiveColor
            }`}
          >
            <card.icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
            <h3 className="text-base sm:text-lg font-semibold">{card.title}</h3>
            <p className="text-xs sm:text-sm opacity-80 mt-1">{card.description}</p>
            {card.subDescription && (
              <p className="text-xs opacity-70 mt-1 truncate">{card.subDescription}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminCards;
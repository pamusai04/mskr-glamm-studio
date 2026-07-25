import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, MessageCircle, Home, Sparkles, Image, Info, Phone, Calendar, Star, MapPin, Mail, Clock, ShoppingBag, User, ChevronRight, Package, Award, Contact, Youtube, Navigation } from 'lucide-react';
import { useSelector } from "react-redux";

const Footer = () => {
  const navigate = useNavigate();
  const { meta } = useSelector((state) => state.meta);
  const { services } = useSelector((state) => state.landingPage);

  const defaultMeta = {
    locationName: "Anakapalli, Andhra Pradesh, India",
    location: {
      address: "Anakapalli, Andhra Pradesh, India.",
      lat: 17.6914,
      lng: 83.0034
    },
    phoneNumber: "+919133293876",
    timeSlots: [
      { startTime: "09:00 AM", endTime: "09:00 PM" }
    ]
  };

  const metaData = services?.[0] || meta || defaultMeta;
  const phoneNumber = metaData?.phoneNumber || defaultMeta.phoneNumber;
  const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  const timeSlots = defaultMeta.timeSlots;
  const locationData = metaData?.location || defaultMeta.location;

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = 70;
      const offsetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const sectionLinks = [
    { label: 'Home', id: 'home', icon: Home },
    { label: 'Packages', id: 'packages', icon: Package },
    { label: 'About', id: 'about', icon: Info },
    { label: 'Contact', id: 'contact', icon: Contact },
    { label: 'Features', id: 'features', icon: Award },
  ];

  const location = locationData?.address || metaData?.locationName || defaultMeta.location.address;
  const firstSlot = timeSlots[0];
  const lastSlot = timeSlots[timeSlots.length - 1];

  const getGoogleMapsUrl = () => {
    if (locationData?.lat && locationData?.lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${locationData.lat},${locationData.lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                MSKR GLAMM STUDIO
              </h3>
              <p className="text-xs text-gray-400 mt-1">Professional Makeup Artist</p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Creating timeless beauty for your most special moments.
            </p>
          </div>

          <div>
            <h4 className="text-gray-800 font-semibold text-sm mb-4">Quick Navigation</h4>
            <ul className="space-y-2">
              {sectionLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-pink-500 text-sm transition-colors group"
                    >
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className="text-gray-800 font-semibold text-sm mb-4">Get In Touch</h4>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href="https://www.instagram.com/mskr_glamm_studio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 hover:text-pink-500 hover:bg-pink-50 transition-all duration-300 shadow-sm border border-gray-200 hover:border-pink-200 w-fit"
                  >
                    <Instagram size={18} />
                    <span>Instagram</span>
                  </a>
                  
                  <a
                    href="https://www.youtube.com/@MSKR_GLAMM_STUDIO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all duration-300 shadow-sm border border-gray-200 hover:border-red-200 w-fit"
                  >
                    <Youtube size={18} />
                    <span>YouTube</span>
                  </a>

                  <a
                    href={`https://wa.me/${cleanPhoneNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 hover:text-green-500 hover:bg-green-50 transition-all duration-300 shadow-sm border border-gray-200 hover:border-green-200 w-fit"
                  >
                    <MessageCircle size={18} />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={getGoogleMapsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 shadow-sm border border-gray-200 hover:border-blue-200 w-fit"
                  >
                    <Navigation size={18} />
                    <span>Find Location</span>
                  </a>
                </div>

                <div className="flex gap-3 items-center group cursor-pointer">
                  <div className="p-2 bg-white rounded-full text-gray-600 group-hover:text-pink-500 group-hover:bg-pink-50 transition-all duration-300 shadow-sm">
                    <Clock size={16} className="group-hover:text-pink-500 transition-colors" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm group-hover:text-pink-500 transition-colors">
                      {firstSlot?.startTime} - {lastSlot?.endTime}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 group-hover:text-pink-400 transition-colors">Open Daily</p>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 pb-10 md:pb-0 text-gray-500 flex justify-center">
          <p>
            © {new Date().getFullYear()} MSKR GLAMM STUDIO.
            <span> All rights reserved.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
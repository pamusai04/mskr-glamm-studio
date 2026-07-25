
import React, { useEffect, useRef } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Navigation } from 'lucide-react';
import { useSelector } from "react-redux";
import ContactInfo from './ContactInfo';
import BookingForm from './BookingForm';
import { motion } from 'framer-motion';

const Contact = () => {
  const { serviceMeta, bookingsCount, servicesCount, usersCount, loading } = useSelector((state) => state.serviceMeta);
  const contactRef = useRef(null);
  const hasScrolled = useRef(false);
  const phoneNumber = serviceMeta?.phoneNumber || "+91 9133293876";
  const location = serviceMeta?.location?.address || "Anakapalli, Andhra Pradesh, India";
  const lat = serviceMeta?.location?.lat;
  const lng = serviceMeta?.location?.lng;
  const gmailId = serviceMeta?.gmailId || "mskr.glammstudio@gmail.com";
  const studioName = "MSKR GLAMM STUDIO";
  
  useEffect(() => {
    if (hasScrolled.current) return;
    const timer = setTimeout(() => {
      if (!contactRef.current) return;

      hasScrolled.current = true;
      const navbarHeight = 80;
      const elementPosition =contactRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: "smooth",
      });
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const getGoogleMapsUrl = () => {
    if (lat && lng) {
      return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`;
  };

  const getDirectionsUrl = () => {
    if (lat && lng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="contact" 
      ref={contactRef}
      className="py-8 sm:py-12 md:py-16 lg:py-20 bg-linear-to-br from-pink-50 via-white to-pink-50 px-4 sm:px-6 lg:px-8 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
            Let's Create Magic
          </h2>
          <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-linear-to-r from-pink-500 to-pink-400 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 mb-8 sm:mb-10 md:mb-12">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl sm:rounded-3xl md:rounded-4xl overflow-hidden shadow-soft p-3 sm:p-4 md:p-5"
          >
            <p className="text-gray-600 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg leading-relaxed">
              Book your session with {location.split(',')[0] || 'Anakapalli'}'s premier makeup artist. Whether it's your wedding day
              or a special celebration, we ensure you look breathtaking.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <ContactInfo 
                icon={Phone}
                label="Call Us"
                value={phoneNumber}
                link={`tel:${phoneNumber.replace(/\s/g, '')}`}
              />
              <ContactInfo 
                icon={MessageCircle}
                label="WhatsApp"
                value="Chat with us"
                link={`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}`}
              />
              <ContactInfo 
                icon={Mail}
                label="Email"
                value={gmailId}
                link={`mailto:${gmailId}`}
              />
              <ContactInfo 
                icon={MapPin}
                label="Location"
                value={location}
                link={null}
              />
              
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-300 group"
                style={{ backgroundColor: '#66339910', border: '1px solid #66339920' }}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#66339920' }}
                >
                  <Navigation className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" style={{ color: '#663399' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs text-gray-500">Get Directions</p>
                  <p className="text-xs sm:text-sm font-medium group-hover:transition-colors" 
                    style={{ color: '#663399' }}>
                    Navigate to Studio
                  </p>
                </div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" 
                  style={{ color: '#663399' }} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 25">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 sm:space-y-5 md:space-y-6"
          > 
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-pink-500/10 via-pink-400/5 to-pink-500/10 rounded-2xl sm:rounded-3xl blur-xl" />
              <div className="relative bg-white p-4 sm:p-6 md:p-7 lg:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-pink-100 shadow-pink-100/20">
                <div className="absolute top-0 right-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-linear-to-br from-pink-500/5 to-pink-400/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-linear-to-tr from-pink-500/5 to-pink-400/5 rounded-full blur-2xl" />
                <BookingForm />
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-pink-100 overflow-hidden mt-6 sm:mt-8 md:mt-10"
        >
          <div className="p-3 sm:p-4" style={{ backgroundColor: '#66339910', borderBottom: '1px solid #66339920' }}>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#663399' }} />
              Find Us Here
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{location}</p>
          </div>
          
          <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 w-full bg-gray-100">
            <iframe
              title="Studio Location"
              src={getGoogleMapsUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
          
          <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold sm:text-sm text-gray-600">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse" style={{ backgroundColor: '#663399' }}></div>
                <span>📍 {studioName}</span>
              </div>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: '#663399' }}
              >
                Open in Google Maps
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Image, ArrowRight, AlertCircle, CheckCircle, Home, Sparkles, Phone, Calendar } from 'lucide-react';
import heroBridal from '../assets/hero-bridal.jpg';
import { useState, useEffect } from 'react';

const Hero = () => {
  const navigate = useNavigate();
  const { heroImages } = useSelector((state) => state.landingPage);
  const { services } = useSelector((state) => state.landingPage);
  const [showText, setShowText] = useState(true);
  
  const heroImage = heroImages?.main_hero?.url || heroBridal;
  const hasImage = heroImages?.main_hero?.url || heroBridal;
  const location = services?.[0]?.location?.address || "Anakapalli";
  const shopClosureDates = services?.[0]?.shopClosureDates || [];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(false);
    }, 8000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const checkIfParlorClosed = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return shopClosureDates.some(closure => {
      const closureDate = new Date(closure.date);
      closureDate.setHours(0, 0, 0, 0);
      return closureDate.getTime() === today.getTime();
    });
  };
  
  const getTodayClosureReason = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const closure = shopClosureDates.find(closure => {
      const closureDate = new Date(closure.date);
      closureDate.setHours(0, 0, 0, 0);
      return closureDate.getTime() === today.getTime();
    });
    
    return closure?.reason || "Parlor Closed Today";
  };
  
  const isParlorClosed = checkIfParlorClosed();

  return (
    <section 
      id="home" 
      className="relative flex items-end justify-center overflow-hidden min-h-[calc(100vh-80px-48px)] sm:min-h-[calc(100vh-80px-32px)] md:min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-80px)]"
    >
      <div className="absolute inset-0 z-0">
        {hasImage ? (
          <>
            <img
              src={heroImage}
              className="w-full h-full object-cover"
              alt="Professional Bridal Makeup by Msk Makeover"
              loading="eager"
            />
            
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-16 h-16 text-pink-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fab fab-flower fixed bottom-17 lg:bottom-6 right-6 z-50">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-4 border-pink-500 animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-0 rounded-full border-4 border-pink-300 animate-ping opacity-75"></div>
          <div tabIndex={0} role="button" className="btn btn-lg btn-circle bg-pink-500 hover:bg-pink-600 border-none shadow-lg relative z-10">
            {showText ? (
              <span className="loading loading-spinner loading-md text-white"></span>
            ) : (
              (isParlorClosed ? <AlertCircle className="w-6 h-6 text-white" /> : <CheckCircle className="w-6 h-6 text-white" />)
            )}
          </div>
        </div>

        <button className="fab-main-action btn btn-circle btn-lg bg-white hover:bg-gray-100 text-pink-500 border-none shadow-lg">
          <Sparkles className="w-6 h-6" />
        </button>

        <div 
          className={`tooltip tooltip-top ${isParlorClosed ? 'tooltip-error' : 'tooltip-success'}`} 
          data-tip={isParlorClosed ? `Closed: ${getTodayClosureReason()}` : "Parlor Open - Book Now"}
        >
          <button 
            onClick={() => {
              if (!isParlorClosed) {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
            className={`btn btn-lg btn-circle bg-white hover:bg-gray-100 border-none shadow-lg ${isParlorClosed ? 'text-red-500' : 'text-green-500'}`}
          >
            {isParlorClosed ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          </button>
        </div>

        <div className="tooltip tooltip-left" data-tip="Home Service Available">
          <button 
            onClick={() => navigate('/services')}
            className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-purple-600 border-none shadow-lg"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>

        <div className="tooltip tooltip-left" data-tip="Contact Us">
          <button 
            onClick={() => navigate('/contact')}
            className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-blue-600 border-none shadow-lg"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>

        <div className="tooltip tooltip-left" data-tip="Book Appointment">
          <button 
            onClick={() => navigate('/cart')}
            className="btn btn-lg btn-circle bg-white hover:bg-gray-100 text-orange-500 border-none shadow-lg"
          >
            <Calendar className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content at bottom with text shadow for readability */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
        className="relative z-10 text-center px-6 pb-12 md:pb-16 lg:pb-20 w-full"
      >
        {hasImage ? (
          <>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              MSKR GLAMM STUDIO
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg tracking-[0.25em] uppercase mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              Professional Makeup Artist
            </p>
            <p className="text-white/80 text-xs sm:text-sm md:text-base mb-6 max-w-md mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              Timeless beauty for your special moments in {location}
            </p>
            <motion.button
              onClick={() => navigate('/services')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-white text-sm sm:text-base overflow-hidden shadow-lg hover:shadow-xl group bg-gradient-to-r from-pink-500 via-pink-400 to-pink-500 hover:from-pink-600 hover:via-pink-500 hover:to-pink-600 bg-[length:200%_100%] hover:bg-[length:200%_100%] hover:bg-right transition-all duration-500"
            >
              <span className="flex items-center gap-2">
                View Services
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gray-800 mb-2">
              MSKR <span className="text-pink-500">GLAMM STUDIO</span>
            </h1>
            <p className="text-pink-500 text-sm sm:text-base md:text-lg tracking-[0.25em] uppercase mb-2 font-semibold">
              Professional Makeup Artist
            </p>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-6 max-w-md mx-auto">
              Timeless beauty for your special moments in <span className="text-pink-500 font-medium">{location}</span>
            </p>
            <motion.button
              onClick={() => navigate('/services')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-white text-sm sm:text-base overflow-hidden shadow-lg hover:shadow-xl bg-pink-500 hover:bg-pink-600 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                View Services
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </motion.button>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default Hero;
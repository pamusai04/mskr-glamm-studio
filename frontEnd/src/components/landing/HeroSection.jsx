import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Sparkles, Settings2, LockKeyhole } from 'lucide-react';
import heroBridal from "../../assets/hero-bridal.jpg";

const HeroSection = memo(({ handleGetStarted }) => {
  const { heroImages } = useSelector((state) => state.landingPage);
  const homeHeroImage = heroImages?.landing_hero_image?.url || heroBridal;
  
  const [showPopup, setShowPopup] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showServices, setShowServices] = useState(false);
  const [showClickMe, setShowClickMe] = useState(false);
  const hasShownPopup = useRef(false);

  useEffect(() => {
    if (!hasShownPopup.current) {
      hasShownPopup.current = true;
      setShowPopup(true);
      setShowWelcome(true);
      setShowServices(false);
    }
  }, []);

  const handleWelcomeNext = () => {
    setShowWelcome(false);
    setShowServices(true);
  };

  const handleClose = () => {
    setShowPopup(false);
    setShowClickMe(true);
  };

  const handleClickMe = () => {
    setShowPopup(true);
    setShowWelcome(true);
    setShowServices(false);
    setShowClickMe(false);
  };

  return (
    <div id="home" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32 pb-12 md:pb-16 scroll-mt-20">
      <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-200px)] md:min-h-[calc(100vh-250px)]">
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="order-2 lg:order-1"
        >
          <motion.div 
            className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-pink-50 rounded-full mb-4 md:mb-5 border border-pink-100"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="text-pink-500 text-xs md:text-sm font-semibold">✨ Welcome to Excellence</span>
          </motion.div>
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          >
            Transform Your <span className="text-pink-500">Beauty Journey</span>
          </motion.h1>
          <motion.p 
            className="text-sm md:text-base text-gray-500 mb-6 md:mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            Experience the art of professional makeup with personalized care. 
            <strong className="font-semibold text-gray-700"> Whether it's your wedding day, engagement party, birthday celebration or special events </strong>, we make you look and feel extraordinary.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap items-center gap-3 md:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
          >
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={handleGetStarted} 
              className="px-6 py-2.5 md:px-8 md:py-3 bg-pink-500 text-white rounded-full font-semibold text-sm md:text-base shadow-md shadow-pink-200 hover:shadow-lg transition-all cursor-pointer"
            >
              Get Started
            </motion.button>
            
            {showClickMe && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={handleClickMe}
                className="px-6 py-2.5 md:px-8 md:py-3 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm md:text-base hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
              >
                Click Me 👆
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }} 
          className="relative order-1 lg:order-2"
        >
          <motion.div 
            className="relative w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-xl border border-gray-100"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={homeHeroImage}  
              alt="MSK Makeover Studio" 
              loading="eager" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              className="max-w-sm w-full bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-2xl border border-pink-100 p-6 relative"
            >
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col"
                >
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-10 h-10 text-pink-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Welcome to <span className="text-pink-500">MSKR GLAMM STUDIO</span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Your beauty journey starts here!</p>
                  </div>

                  {/* Chrome 3rd Party Cookies Fix Steps */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-xs font-semibold text-blue-800 mb-2">🔧 Chrome Users - Fix Login Issues:</p>
                    <div className="space-y-1.5 text-xs text-gray-700">
                      <p className="flex items-start gap-2">
                        <span className="font-bold text-blue-600">1.</span>
                        <span>Click the lock icon <LockKeyhole className="inline-block w-3.5 h-3.5 text-gray-700" /> (or <Settings2 className="inline-block w-3 h-3" /> on mobile) on the left side of the URL</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-bold text-blue-600">2.</span>
                        <span>Click on <strong>"Cookies"</strong> (or <strong>"Site settings"</strong>)</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-bold text-blue-600">3.</span>
                        <span>Find <strong>"Third-party cookies"</strong> and change from <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Block</span> to <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold">Allow</span></span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="font-bold text-blue-600">4.</span>
                        <span>Create your account or login</span>
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleWelcomeNext}
                    className="px-6 py-2.5 bg-pink-500 text-white rounded-full font-semibold text-sm hover:bg-pink-600 transition-all shadow-md shadow-pink-200 hover:shadow-lg w-full"
                  >
                    Next →
                  </button>
                </motion.div>
              )}

              {showServices && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col"
                >
                  <div className="text-center mb-4">
                    <p className="text-xs text-pink-700 font-semibold px-3 py-1 bg-pink-100 border border-pink-200 rounded-full inline-block">
                      ✨ Only Home Services Available ✨
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-2xl">💍</span>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">Wedding</p>
                        <p className="text-xs text-gray-500">Bridal makeup & styling</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-2xl">🎉</span>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">Birthday</p>
                        <p className="text-xs text-gray-500">Party & celebration looks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-2xl">🌟</span>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">Special Events</p>
                        <p className="text-xs text-gray-500">Engagement, parties & more</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-2xl">🌴</span>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">Vacations</p>
                        <p className="text-xs text-gray-500">Holiday & travel glam</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <span className="text-2xl">🏠</span>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">Home Services</p>
                        <p className="text-xs text-gray-500">Professional makeup at your comfort</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-pink-500 text-white rounded-full font-semibold text-sm hover:bg-pink-600 transition-all shadow-md shadow-pink-200 hover:shadow-lg w-full"
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
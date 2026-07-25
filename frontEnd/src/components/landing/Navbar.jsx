import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Info, Sparkles, Phone, Gift, ShieldCheck } from 'lucide-react';

const Navbar = memo(({ handleLogin, handleSignup, handleVerifyEmail, scrollToSection }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        } border-b border-gray-100 h-16 md:h-20`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto">
            <Link to="/" onClick={() => setIsDrawerOpen(false)} className="flex flex-col shrink-0 text-center">
              <span className="text-lg md:text-xl font-bold text-pink-500">MSKR GLAMM STUDIO</span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.2em] text-gray-400 leading-tight uppercase hidden sm:block">Professional Makeup Artist</span>
            </Link>

            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {['Home', 'Packages', 'About', 'Contact', 'Features'].map((section, index) => {
                const sectionId = section === 'Packages' ? 'packages' : section.toLowerCase();
                return (
                  <motion.button 
                    key={section} 
                    onClick={() => scrollToSection(sectionId)} 
                    className="text-sm xl:text-base text-gray-600 hover:text-pink-500 transition-colors font-medium cursor-pointer"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {section}
                  </motion.button>
                );
              })}
              
              <motion.button 
                onClick={handleVerifyEmail} 
                className="text-sm xl:text-base text-blue-500 hover:text-blue-600 transition-colors font-medium flex items-center gap-1 cursor-pointer"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Email
              </motion.button>
              
              <motion.button 
                onClick={handleLogin} 
                className="px-4 py-1.5 text-sm xl:text-base text-pink-500 border border-pink-500 rounded-full hover:bg-pink-500 hover:text-white transition-all cursor-pointer"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
              <motion.button 
                onClick={handleSignup} 
                className="px-4 py-1.5 text-sm xl:text-base bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all shadow-md shadow-pink-200 cursor-pointer"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </div>
            
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)} 
              className="lg:hidden text-gray-600 hover:text-pink-500 cursor-pointer"
            >
              {isDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
              onClick={() => setIsDrawerOpen(false)} 
            />
            <motion.div 
              className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="text-base font-bold text-gray-800">Menu</span>
                <button onClick={() => setIsDrawerOpen(false)} className="text-gray-400 hover:text-pink-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4">
                {['Home', 'Packages', 'About', 'Contact', 'Features'].map((section) => {
                  const sectionId = section === 'Packages' ? 'packages' : section.toLowerCase();
                  const iconMap = {
                    'Home': Home,
                    'About': Info,
                    'Packages': Gift,
                    'Contact': Phone,
                    'Features': Sparkles
                  };
                  const IconComponent = iconMap[section];
                  
                  return (
                    <motion.button 
                      key={section} 
                      onClick={() => { scrollToSection(sectionId); setIsDrawerOpen(false); }} 
                      className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-pink-500 transition-colors mb-2 cursor-pointer"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <IconComponent className="w-5 h-5" />
                      {section}
                    </motion.button>
                  );
                })}
                
                <motion.button 
                  onClick={() => { handleVerifyEmail(); setIsDrawerOpen(false); }} 
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-blue-500 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 transition-colors mb-2 cursor-pointer"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShieldCheck className="w-5 h-5" />
                  Verify Email
                </motion.button>
                
                <div className="border-t border-gray-100 my-3 pt-3">
                  <motion.button 
                    onClick={() => { handleLogin(); setIsDrawerOpen(false); }} 
                    className="w-full p-3 rounded-lg text-pink-500 bg-pink-50 hover:bg-pink-100 hover:text-pink-600 transition-colors mb-2 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Login
                  </motion.button>
                  <motion.button 
                    onClick={() => { handleSignup(); setIsDrawerOpen(false); }} 
                    className="w-full p-3 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign Up
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
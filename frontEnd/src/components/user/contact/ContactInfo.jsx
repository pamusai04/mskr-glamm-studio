
import React from 'react';
import { motion } from 'framer-motion';

const ContactInfo = ({ icon: Icon, label, value, link, delay = 0 }) => {
  const MotionDiv = motion.div;
  
  const handleCardClick = () => {
    if (link) {
      if (link.startsWith('http') || link.startsWith('https')) {
        window.open(link, '_blank', 'noopener noreferrer');
      } else if (link.startsWith('tel:')) {
        window.location.href = link;
      } else if (link.startsWith('mailto:')) {
        window.location.href = link;
      } else {
        window.open(link, '_blank', 'noopener noreferrer');
      }
    }
  };
  
  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className="flex items-center gap-3 sm:gap-4 group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-linear-to-r from-pink-500/10 to-pink-400/10 text-pink-500 flex items-center justify-center shrink-0 transition-all duration-300">
        <Icon size={16} className="sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] sm:text-xs uppercase tracking-wider font-medium text-gray-500 group-hover:text-[#663399] transition-colors duration-300">
          {label}
        </p>
        {link ? (
          <motion.a
            whileHover={{ x: 5 }}
            className="font-semibold text-gray-800 group-hover:text-secondary transition-colors duration-300 inline-block text-xs sm:text-sm md:text-base cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </motion.a>
        ) : (
          <motion.p 
            whileHover={{ x: 5 }}
            className="font-semibold text-gray-800 group-hover:text-secondary transition-colors duration-300 text-xs sm:text-sm md:text-base"
          >
            {value}
          </motion.p>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
        <svg 
          className="w-4 h-4 sm:w-5 sm:h-5" 
          style={{ color: '#663399' }} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </MotionDiv>
  );
};

export default ContactInfo;
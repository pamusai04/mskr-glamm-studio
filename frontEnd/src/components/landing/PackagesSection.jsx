import { memo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const occasionCards = [
  {
    icon: "💍",
    title: "Wedding",
    description: "Bridal & wedding makeup packages",
    color: "from-pink-400 to-rose-500"
  },
  {
    icon: "🎂",
    title: "Birthday",
    description: "Birthday party makeup & styling",
    color: "from-purple-400 to-violet-500"
  },
  {
    icon: "💑",
    title: "Engagement",
    description: "Engagement & pre-wedding looks",
    color: "from-indigo-400 to-blue-500"
  },
  {
    icon: "🎊",
    title: "Special Events",
    description: "Festival, party & special occasion makeup",
    color: "from-orange-400 to-red-500"
  }
];

const OccasionCard = memo(({ item, index }) => {
  const navigate = useNavigate();
  
  const handleBookNow = () => {
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      viewport={{ once: false, amount: 0.2 }}
      whileHover={{ 
        y: -8,
        scale: 1.03,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="group cursor-pointer h-full flex"
      onClick={handleBookNow}
    >
      <div className={`relative p-6 md:p-8 bg-gradient-to-br ${item.color} rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer w-full flex flex-col items-center justify-center`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col items-center text-center text-white w-full">
          <div className="text-5xl md:text-6xl mb-4 inline-block group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
            {item.icon}
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-2 group-hover:scale-105 transition-all duration-300">
            {item.title}
          </h3>
          <p className="text-sm md:text-base text-white/90 group-hover:scale-102 transition-all duration-300 flex-1">
            {item.description}
          </p>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow();
            }}
            className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-semibold hover:bg-white/30 transition-all group-hover:scale-105 cursor-pointer"
          >
            Book Now →
          </button>
        </div>
      </div>
    </motion.div>
  );
});

OccasionCard.displayName = 'OccasionCard';

const PackagesSection = memo(() => {
  return (
    <section id="packages" className="bg-white py-16 md:py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-10 md:mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Special Occasion Packages
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto">
            Customized makeup services for your special moments
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {occasionCards.map((item, index) => (
            <OccasionCard key={index} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
});

PackagesSection.displayName = 'PackagesSection';
export default PackagesSection;
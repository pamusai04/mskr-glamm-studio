import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import heroBridal from "../../assets/hero-bridal.jpg";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: "easeOut" 
    }
  }
};

const AboutSection = memo(() => {
  const [isTelugu, setIsTelugu] = useState(false);
  const { services, statistics, isLoading, heroImages } = useSelector((state) => state.landingPage);
  const aboutHeroImage = heroImages?.about_hero_image?.url || heroBridal;

  const content = {
    title: isTelugu ? "మీ అందం, మా ఆసక్తి" : "Your Beauty, Our Passion",
    para1: isTelugu ? 
      "అనకాపల్లిలో ఉన్న MSKR GLAMM STUDIO అనేది ప్రొఫెషనల్ మేకప్, మెహెందీ డిజైన్స్, బ్యూటీ ట్రీట్‌మెంట్స్ మరియు నెయిల్ సర్వీసెస్ అందించే అందాల గమ్యస్థానం. వివాహాలు, పుట్టినరోజులు మరియు అన్ని ప్రత్యేక కార్యక్రమాల కోసం సేవలు అందిస్తాము, ప్రతి సందర్భంలో మీరు అందంగా కనిపించేలా చేస్తాము." :
      "MSKR GLAMM STUDIO is a beauty destination in Anakapalli offering professional makeup, mehendi designs, beauty treatments, and nail services. We provide services for marriages, birthdays, and all special functions, helping you look beautiful for every occasion.",
    para2: isTelugu ?
      "మేము మీ సహజమైన అందాన్ని మరింత అందంగా చూపించేందుకు శ్రద్ధతో పని చేస్తాము. బ్రైడల్ లుక్, పార్టీ మేకప్ లేదా సాధారణ ఎలిగెంట్ స్టైలింగ్ అయినా, మీ ప్రత్యేక రోజున మీరు ఆత్మవిశ్వాసంగా మరియు ప్రత్యేకంగా అనిపించేలా చేస్తాము." :
      "With dedication and creativity, we focus on enhancing your natural beauty. Whether it is a bridal look, party makeup, or simple elegant styling, we make sure you feel confident and special on your important day."
  };

  const stats = !isLoading && statistics?.totalClients
    ? [
        { num: `${statistics.totalClients}+`, label: 'Happy Clients' },
        { num: `${statistics.totalBookings}+`, label: 'Total Bookings' },
        { num: `${statistics.totalServices}+`, label: 'Services' }
      ]
    : [
        { num: '500+', label: 'Happy Clients' },
        { num: '1000+', label: 'Total Bookings' },
        { num: '50+', label: 'Services' }
      ];

  return (
    <section id="about" className="bg-gray-50 py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-100 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <motion.h1 
            variants={fadeInUp} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: false, amount: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
          >
            About MSKR GLAMM STUDIO
          </motion.h1>
          <motion.p 
            variants={fadeInUp} 
            initial="hidden" 
            whileInView="visible" 
            transition={{ delay: 0.2 }} 
            viewport={{ once: false, amount: 0.2 }}
            className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto"
          >
            Professional makeup artist dedicated to enhancing your natural beauty
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 mx-auto rounded-full mt-3" 
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-xl sticky top-24"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <img src={aboutHeroImage} loading="lazy" alt="MSK Makeover Studio" className="w-full h-64 md:h-80 object-cover" />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: false, amount: 0.2 }} 
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col"
          >
            <div className="flex justify-end mb-4">
              <motion.button 
                onClick={() => setIsTelugu(!isTelugu)} 
                className="px-3 py-1.5 rounded-full bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500 text-xs transition-colors border border-gray-200 flex items-center gap-2 shadow-sm cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={isTelugu ? "opacity-50" : "font-semibold"}>English</span>
                <span className="text-gray-300">|</span>
                <span className={isTelugu ? "font-semibold" : "opacity-50"}>తెలుగు</span>
              </motion.button>
            </div>
            
            <div className="flex-1">
              <motion.h3 
                className="text-xl md:text-2xl mb-3 font-bold text-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.2 }}
              >
                {content.title}
              </motion.h3>
              
              <div className="relative min-h-[120px] md:min-h-[100px]">
                <motion.p 
                  className="text-sm md:text-base text-gray-600 leading-relaxed mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  key={isTelugu ? 'telugu-para1' : 'english-para1'}
                >
                  {content.para1}
                </motion.p>
              </div>
              
              <div className="relative min-h-[80px] md:min-h-[60px]">
                <motion.p 
                  className="text-sm md:text-base text-gray-600 leading-relaxed mb-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                  key={isTelugu ? 'telugu-para2' : 'english-para2'}
                >
                  {content.para2}
                </motion.p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="text-center p-3 bg-white rounded-xl border border-gray-100 animate-pulse">
                    <div className="h-6 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))
              ) : (
                stats.map((stat, index) => (
                  <motion.div 
                    key={stat.label} 
                    className="text-center p-3 bg-white rounded-xl border border-dashed border-gray-300 hover:border-pink-300 hover:shadow-md transition-all hover:-translate-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, ease: "easeOut" }}
                    viewport={{ once: false, amount: 0.2 }}
                    whileHover={{ y: -4 }}
                  >
                    <motion.p 
                      className="text-xl md:text-2xl font-bold font-serif text-pink-500"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 400 }}
                      viewport={{ once: false, amount: 0.2 }}
                    >
                      {stat.num}
                    </motion.p>
                    <p className="text-xs md:text-sm text-gray-500 font-bold">{stat.label}</p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
export default AboutSection;
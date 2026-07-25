import React, { useState, memo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Award, Heart, Users, Clock, X, ChevronLeft, ChevronRight } from 'lucide-react';
import aboutImage from "../../assets/hero-bridal.jpg";
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from "react-router-dom";

const About = memo(() => {
  const [isTelugu, setIsTelugu] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0);
  const aboutRef = useRef(null);
  const hasScrolled = useRef(false);
  
  const { bookingsCount, servicesCount, usersCount, loading } = useSelector((state) => state.serviceMeta);
  
  const { heroImages } = useSelector((state) => state.landingPage);
  const aboutHeroImage = heroImages?.about_hero_image?.url || aboutImage;

  
  const certificates = [
    {
      id: 1,
      src: "https://res.cloudinary.com/dja19jenl/image/upload/f_auto,q_auto/cirtificate_msk_hmzjtz",
      alt: "Professional Makeup and Hair Styling Certificate",
      title: "Professional Makeup & Hair Styling Certification"
    },
    {
      id: 2,
      src: "https://drive.google.com/thumbnail?id=1EeybYePuKrSOsrsQlkBlUUQrG38o-vbF&sz=w1600",
      alt: "Beauty Parlour Management Certificate",
      title: "Beauty Parlour Management Certification"
    },
    {
      id: 3,
      src: "https://lh3.googleusercontent.com/d/1X2hjaF4kg8W_k1bzGXz5iylDHgSD6IrW=w1000?authuser=0",
      alt: "Makeup and Nail Art Seminar Certificate",
      title: "Makeup & Nail Art Seminar Certification"
    }
    
  ];

  useEffect(() => {
    if (!hasScrolled.current && aboutRef.current) {
      hasScrolled.current = true;
      setTimeout(() => {
        const navbarHeight = 80;
        const elementPosition = aboutRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }, 200);
    }
  }, []);
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const cardHover = {
    rest: { y: 0, scale: 1 },
    hover: { 
      y: -8, 
      scale: 1.02,
      transition: { 
        duration: 0.2,
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  const iconHover = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.15, 
      rotate: 5,
      transition: { duration: 0.2 }
    }
  };

  const nextCertificate = () => {
    setCurrentCertificateIndex((prev) => (prev + 1) % certificates.length);
  };

  const prevCertificate = () => {
    setCurrentCertificateIndex((prev) => (prev - 1 + certificates.length) % certificates.length);
  };

  const goToCertificate = (index) => {
    setCurrentCertificateIndex(index);
  };

  const stats = !loading
    ? [
        { num: bookingsCount, label: 'Total Bookings' },
        { num: servicesCount , label: 'Services' },
        { num: usersCount, label: 'Happy Clients' }
      ]
    : [
        { num: '500+', label: 'Happy Brides' },
        { num: '8+', label: 'Years Experience' },
        { num: '50+', label: 'Services' }
      ];

  const features = [
    { 
      icon: Award, 
      title: "Certified Professional", 
      desc: "Certified makeup artist with professional training and expertise",
      hasCertificate: true
    },
    { icon: Heart, title: "Passionate Service", desc: "Dedicated to making you feel beautiful" },
    { icon: Users, title: "Client Focused", desc: "Your satisfaction is our priority" },
    { icon: Clock, title: "Timely Service", desc: "Respecting your time and schedule" }
  ];

  const content = {
    title: isTelugu ? "మీ అందం, మా ఆసక్తి" : "Your Beauty, Our Passion",
    para1: isTelugu ? 
      "అనకాపల్లిలో ఉన్న MSKR GLAMM STUDIO అనేది ప్రొఫెషనల్ మేకప్, మెహెందీ డిజైన్స్, బ్యూటీ ట్రీట్‌మెంట్స్ మరియు నెయిల్ సర్వీసెస్ అందించే అందాల గమ్యస్థానం. వివాహాలు, పుట్టినరోజులు మరియు అన్ని ప్రత్యేక కార్యక్రమాల కోసం సేవలు అందిస్తాము, ప్రతి సందర్భంలో మీరు అందంగా కనిపించేలా చేస్తాము." :
      "MSKR GLAMM STUDIO is a beauty destination in Anakapalli offering professional makeup, mehendi designs, beauty treatments, and nail services. We provide services for marriages, birthdays, and all special functions, helping you look beautiful for every occasion.",
    para2: isTelugu ?
      "మేము మీ సహజమైన అందాన్ని మరింత అందంగా చూపించేందుకు శ్రద్ధతో పని చేస్తాము. బ్రైడల్ లుక్, పార్టీ మేకప్ లేదా సాధారణ ఎలిగెంట్ స్టైలింగ్ అయినా, మీ ప్రత్యేక రోజున మీరు ఆత్మవిశ్వాసంగా మరియు ప్రత్యేకంగా అనిపించేలా చేస్తాము." :
      "With dedication and creativity, we focus on enhancing your natural beauty. Whether it is a bridal look, party makeup, or simple elegant styling, we make sure you feel confident and special on your important day."
  };

  return (
    <section 
      ref={aboutRef}
      className="bg-gray-50 py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-200 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <motion.h1 
            variants={fadeInUp}
            initial="hidden" 
            animate="visible" 
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
          >
            About MSKR GLAMM STUDIO
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4"
          >
            Professional makeup artist dedicated to enhancing your natural beauty
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg"
          >
            <img
              src={aboutHeroImage}
              alt="MSKR GLAMM STUDIO"
              className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover"
              loading="lazy"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-1 sm:px-0"
          >
            <div className="flex justify-end mb-3 sm:mb-4">
              <button
                onClick={() => setIsTelugu(!isTelugu)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-800 text-white hover:text-gray-300 font-medium text-[11px] sm:text-xs md:text-sm transition-colors duration-300 border border-gray-600 flex items-center gap-1.5 sm:gap-2 shadow-sm"
              >
                <span className={isTelugu ? "opacity-50" : "font-semibold"}>English</span>
                <span className="text-gray-400 text-[10px] sm:text-xs">|</span>
                <span className={isTelugu ? "font-semibold" : "opacity-50"}>తెలుగు</span>
              </button>
            </div>

            <h3 className="font-serif text-gray-800 text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 sm:mb-4 md:mb-5 lg:mb-6 font-bold">
              {content.title}
            </h3>
            
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              {content.para1}
            </p>
            
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-6 md:mb-7 lg:mb-8">
              {content.para2}
            </p>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="group relative text-center p-3 sm:p-4 md:p-5 lg:p-6 bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute -top-2 -right-2 w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 bg-gray-100/40 rounded-full blur-xl group-hover:bg-gray-200/50 transition-colors" />
                  <p className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#663399] tracking-tight">
                    {stat.num}+
                  </p>
                  
                  <p className="mt-1 sm:mt-2 md:mt-3 text-[10px] sm:text-xs md:text-sm lg:text-base font-bold text-gray-700 tracking-widest uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 my-8 sm:my-10 md:my-12 lg:my-16"
        >
          {features.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeInUp}
              whileHover="hover"
              initial="rest"
              whileInView="rest"
              viewport={{ once: true }}
              className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm hover:border-gray-300 hover:shadow-xl cursor-pointer group h-full"
              onClick={() => item.hasCertificate && setShowCertificate(true)}
            >
              <motion.div 
                className="p-4 sm:p-5 md:p-6 h-full flex flex-col items-center justify-center text-center"
                variants={cardHover}
              >
                <motion.div variants={iconHover}>
                  <item.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-pink-500 mb-2 sm:mb-3 md:mb-4" />
                </motion.div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-1 sm:mb-2 flex items-center justify-center flex-wrap gap-1">
                  {item.title}
                  {item.hasCertificate && (
                    <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 bg-pink-100 rounded-full">
                      <span className="text-pink-500 text-[10px] sm:text-xs">📜</span>
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                {item.hasCertificate && (
                  <button className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-pink-500 hover:text-pink-600 font-medium underline underline-offset-2">
                    View Certificate
                  </button>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full rounded-2xl sm:rounded-3xl overflow-hidden relative mt-8 mb-10 lg:mb-0 sm:mt-10 md:mt-12 lg:mt-16"
        >
          <motion.div className="bg-gray-900 p-6 sm:p-8 md:p-10 lg:p-12">
            <div className="text-center text-white">
              <motion.h2 
                variants={fadeInUp}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4"
              >
                Ready to Transform Your Look?
              </motion.h2>
              
              <motion.p 
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
                className="text-sm sm:text-base md:text-lg lg:text-xl mb-5 sm:mb-6 md:mb-7 lg:mb-8 text-gray-300"
              >
                Book your appointment today and let us make you shine
              </motion.p>
              
              <motion.div 
                variants={staggerContainer}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              >
                <Link to="/contact">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 sm:px-6 md:px-7 lg:px-8 py-2 sm:py-2.5 md:py-3 border-2 border-white text-white rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-white/20 transition-all duration-300"
                  >
                    Contact Us
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
          
          <div className="absolute top-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-gray-500/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4 pointer-events-none"></div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCertificate(false)}
                className="absolute -top-12 right-0 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors border border-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 bg-white">
                <img
                  src={certificates[currentCertificateIndex].src}
                  alt={certificates[currentCertificateIndex].alt}
                  className="w-full max-h-[70vh] object-contain"
                />
              </div>

              <div className="flex flex-col items-center justify-center mt-4 gap-2">
                <div className="flex items-center justify-between w-full gap-4">
                  <button
                    onClick={prevCertificate}
                    className="p-2 rounded-full text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <div className="flex flex-col items-center justify-center flex-1 min-w-0 gap-2">
                    <div className="flex gap-2 mb-1">
                      {certificates.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToCertificate(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            index === currentCertificateIndex
                              ? 'bg-white w-8'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-white/80 text-sm text-center font-medium px-2">
                      {certificates[currentCertificateIndex].title}
                    </p>
                  </div>
                  
                  <button
                    onClick={nextCertificate}
                    className="p-2 rounded-full text-white hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

export default About;
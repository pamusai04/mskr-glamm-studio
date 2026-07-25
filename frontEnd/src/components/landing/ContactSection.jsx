import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Phone, Clock, ChevronDown, MessageCircle, MapPin, Navigation, Calendar } from 'lucide-react';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(10, 'Phone number must be exactly 10 digits'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  date: z.string().min(1, 'Please select a date'),
  slot: z.string().min(1, 'Please select a time slot'),
  message: z.string().optional(),
});

const ContactInfo = memo(({ icon: Icon, label, value, link, delay = 0 }) => {
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
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      viewport={{ once: false, amount: 0.2 }}
      onClick={handleCardClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-100"
    >
      <motion.div 
        className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-500 flex items-center justify-center shrink-0 transition-all duration-300"
        whileHover={{ scale: 1.1 }}
      >
        <Icon size={18} className="md:w-5 md:h-5" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] md:text-xs uppercase tracking-wider font-medium text-gray-400 group-hover:text-pink-500 transition-colors">
          {label}
        </p>
        <p className="font-semibold text-sm md:text-base text-gray-700 group-hover:text-pink-600 transition-colors">
          {value}
        </p>
      </div>
      <motion.div 
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0"
        whileHover={{ x: 4 }}
      >
        <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </motion.div>
  );
});

ContactInfo.displayName = 'ContactInfo';

const ContactSection = memo(() => {
  const { services } = useSelector((state) => state.landingPage);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    slot: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const datePickerRef = useRef(null);
  const [formError, setFormError] = useState('');
  
  const metaData = services?.[0] || {};
  const phoneNumber = metaData?.phoneNumber || "919000369453";
  const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
  
  const timeSlots = [
    { value: "morning", label: "Morning (09:00 AM - 12:00 PM)" },
    { value: "afternoon", label: "Afternoon (12:01 PM - 3:00 PM)" },
    { value: "evening", label: "Evening (03:01 PM - 06:00 PM)" }
  ] || metaData?.timeSlots?.map(slot => ({
    value: `${slot.startTime}-${slot.endTime}`,
    label: `${slot.startTime} - ${slot.endTime}`,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const handleSlotSelect = (slotValue) => {
    setSelectedSlot(slotValue);
    setFormData(prev => ({ ...prev, slot: slotValue }));
    setSlotOpen(false);
    if (errors.slot) {
      setErrors(prev => ({ ...prev, slot: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    const formattedDate = date.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
    setFormData(prev => ({ ...prev, date: formattedDate }));
    setIsDatePickerOpen(false);
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isDateDisabled = (day) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const today = getMinDate();
    return date < today;
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = daysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const daysArray = [];
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(null);
    }
    for (let i = 1; i <= days; i++) {
      daysArray.push(i);
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-72"
      >
        <div className="flex items-center justify-between mb-4">
          <motion.button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <span className="font-semibold text-gray-800">
            {monthNames[month]} {year}
          </span>
          <motion.button
            type="button"
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-8" />;
            }
            const isToday = day === todayDate && month === todayMonth && year === todayYear;
            const isDisabled = isDateDisabled(day);
            const isSelected = selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            return (
              <motion.button
                key={day}
                type="button"
                onClick={() => !isDisabled && handleDateSelect(day)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.1 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                className={`h-8 w-8 rounded-full text-sm transition-colors mx-auto ${
                  isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isSelected
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : isToday
                    ? 'bg-pink-50 text-pink-600 font-semibold hover:bg-pink-100'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {day}
              </motion.button>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(false)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select Date *';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = {};
    
    if (!formData.name || formData.name.length < 2) {
      validationErrors.name = 'Name is required';
    }
    
    if (!formData.phone || formData.phone.length < 10) {
      validationErrors.phone = 'Please enter a valid 10-digit phone number';
    } else if (formData.phone.length > 10) {
      validationErrors.phone = 'Phone number must be exactly 10 digits';
    }
    
    if (!formData.date) {
      validationErrors.date = 'Please select a date';
    }
    
    if (!formData.slot) {
      validationErrors.slot = 'Please select a time slot';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.email = 'Invalid email address';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError('Please fill all required fields correctly');
      return;
    }
    
    setErrors({});
    setFormError('');
    setIsSubmitting(true);
    
    const selectedSlotData = timeSlots.find(slot => slot.value === formData.slot);
    const message = `
    *MSKR GLAMM STUDIO - New Booking Request*

      Client Details : 
        • Name  : ${formData.name}
        • Phone : ${formData.phone}
        • Email : ${formData.email || "Not Provided"}

      Appointment Details : 
        • Date  : ${formData.date}
        • Time Slot : ${selectedSlotData?.label || formData.slot}

      Special Message : 
        • ${formData.message || "No special requests"}  

      *Thank you for choosing MSKR GLAMM STUDIO*
        `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
    
    setFormData({
      name: '',
      phone: '',
      email: '',
      date: '',
      slot: '',
      message: ''
    });
    setSelectedSlot('');
    setSelectedDate('');
    setIsSubmitting(false);
  };

  const location = metaData?.location?.address || metaData?.locationName || "Anakapalli, Andhra Pradesh, India";
  const lat = metaData?.location?.lat;
  const lng = metaData?.location?.lng;
  
  const getGoogleMapsUrl = () => {
    if (lat && lng) return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`;
  };

  const getDirectionsUrl = () => {
    if (lat && lng) return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`;
  };

  return (
    <section id="contact" className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-8 md:mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Let's Create Magic</h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto">Book your appointment and let us make you look stunning</p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-pink-400 to-pink-500 mx-auto rounded-full mt-3" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 items-start lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col justify-center lg:h-full"
          >
            <p className="text-gray-600 mb-4 md:mb-5 text-sm md:text-base leading-relaxed">
              Book your session with {location.split(',')[0]}'s premier makeup artist.
              Whether it's your wedding day or a special celebration,
              we ensure you look breathtaking.
            </p>

            <div className="space-y-2">
              <ContactInfo
                icon={Phone}
                label="Call Us"
                value={metaData?.phoneNumber || "+91 90003 69453"}
                link={`tel:${(metaData?.phoneNumber || "+91 90003 69453").replace(/\s/g, '')}`}
                delay={0.1}
              />

              <ContactInfo
                icon={MessageCircle}
                label="WhatsApp"
                value="Chat with us"
                link={`https://wa.me/${cleanPhoneNumber}`}
                delay={0.3}
              />

              <ContactInfo
                icon={MapPin}
                label="Location"
                value={location}
                link={null}
                delay={0.4}
              />

              <motion.a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
                viewport={{ once: false, amount: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group hover:bg-gray-50 mt-3 border border-gray-100 overflow-hidden"
              >
                <motion.div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-500 flex items-center justify-center transition-all shrink-0"
                  whileHover={{ scale: 1.1 }}
                >
                  <Navigation className="w-4 h-4 md:w-5 md:h-5" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs text-gray-400">Get Directions</p>
                  <p className="text-xs sm:text-sm md:text-base font-medium text-gray-700 group-hover:text-pink-600 transition-colors">
                    Navigate to Studio
                  </p>
                </div>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: false, amount: 0.2 }}
            className="flex lg:h-full"
          >
            <div className="relative w-full lg:h-full">
              <div className="absolute inset-0 bg-pink-100/20 rounded-xl blur-xl" />
              <div className="relative bg-white p-4 sm:p-5 md:p-6 rounded-xl border border-gray-100 shadow-sm w-full lg:h-full flex flex-col justify-center">
                <motion.form 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  onSubmit={onSubmit} 
                  className="space-y-4"
                >
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full p-3 md:p-4 bg-gray-50 border ${
                          errors.name ? 'border-red-400' : 'border-gray-200'
                        } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-sm md:text-base h-[48px] md:h-[56px]`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter 10 digits mobile number"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        className={`w-full py-3 md:py-4 px-3 md:px-4 bg-gray-50 border ${
                          errors.phone
                            ? 'border-red-400 ring-2 ring-red-100'
                            : 'border-gray-200'
                        } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-sm md:text-base h-[48px] md:h-[56px]`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address (optional)"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-3 md:p-4 bg-gray-50 border ${
                        errors.email ? 'border-red-400' : 'border-gray-200'
                      } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-sm md:text-base h-[48px] md:h-[56px]`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative" ref={datePickerRef}>
                      <motion.div 
                        onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-3 md:p-4 bg-gray-50 border ${
                          errors.date ? 'border-red-400' : 'border-gray-200'
                        } rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-sm md:text-base cursor-pointer flex items-center justify-between h-[48px] md:h-[56px]`}
                      >
                        <span className={selectedDate ? 'text-gray-800' : 'text-gray-400'}>
                          {selectedDate ? formatDisplayDate(selectedDate) : 'Select Date *'}
                        </span>
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                      </motion.div>
                      
                      <AnimatePresence>
                        {isDatePickerOpen && (
                          <motion.div 
                            className="absolute top-full left-0 mt-2 z-50"
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            {renderCalendar()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>
                    
                    <div className="relative">
                      <motion.button
                        type="button"
                        onClick={() => setSlotOpen(!slotOpen)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full p-3 md:p-4 bg-gray-50 border ${
                          errors.slot
                            ? 'border-red-400 ring-2 ring-red-100'
                            : 'border-gray-200'
                        } rounded-xl text-gray-800 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-left flex items-center justify-between text-sm md:text-base h-[48px] md:h-[56px]`}
                      >
                        <span className={selectedSlot ? "text-gray-800" : "text-gray-400"}>
                          {selectedSlot
                            ? timeSlots.find(slot => slot.value === selectedSlot)?.label
                            : "Preferred Slot *"}
                        </span>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                          <motion.div
                            animate={{ rotate: slotOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </motion.button>

                      <AnimatePresence>
                        {slotOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white border border-pink-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                          >
                            <div className="py-1">
                              {timeSlots.map((slot, index) => (
                                <motion.button
                                  key={slot.value}
                                  type="button"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  onClick={() => handleSlotSelect(slot.value)}
                                  whileHover={{ backgroundColor: '#fce7f3', color: '#db2777' }}
                                  className={`w-full px-4 py-3 text-left transition-all duration-150 text-sm md:text-base ${
                                    selectedSlot === slot.value
                                      ? 'bg-pink-50 text-pink-600 font-medium'
                                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                                  }`}
                                >
                                  <div className="flex flex-col">
                                    <span>{slot.label}</span>
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {errors.slot && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.slot}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <textarea
                      name="message"
                      placeholder="Any special requests? (optional)"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all text-sm md:text-base resize-none h-auto min-h-[48px] md:min-h-[56px]"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl py-3 md:py-4 text-sm md:text-base transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span 
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </span>
                    ) : (
                      'Confirm Booking Request'
                    )}
                  </motion.button>
                </motion.form>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.2 }}
          className="mt-8 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
        >
          <div className="p-3 md:p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm md:text-base font-semibold text-gray-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-pink-500" />
              Find Us Here
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{location}</p>
          </div>
          
          <div className="relative h-80 md:h-96 w-full bg-gray-100">
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
            />
          </div>
          
          <div className="p-3 md:p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-pink-500" />
                <span>📍 {metaData?.locationName || "MSK Makeover Studio"}</span>
              </div>
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm font-medium text-pink-500 hover:text-pink-600 flex items-center gap-1 transition-colors shrink-0"
              >
                Open in Google Maps
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';
export default ContactSection;
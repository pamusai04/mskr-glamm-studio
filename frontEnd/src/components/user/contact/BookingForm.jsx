import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import { useSelector } from "react-redux";
import { Clock, ChevronDown, Calendar } from 'lucide-react';

const FormField = ({ register, placeholder, type = 'text', error, rows }) => {
  const baseClassName = `w-full p-2.5 sm:p-3 md:p-4 bg-transparent border ${
    error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
  } rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-xs sm:text-sm md:text-base`;

  if (type === 'textarea') {
    return (
      <div>
        <textarea
          {...register}
          placeholder={placeholder}
          rows={rows}
          className={`${baseClassName} resize-none`}
        />
        {error && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{error.message}</p>}
      </div>
    );
  }

  return (
    <div>
      <input
        {...register}
        type={type}
        placeholder={placeholder}
        className={baseClassName}
      />
      {error && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{error.message}</p>}
    </div>
  );
};

const BookingForm = () => {
  const { meta } = useSelector((state) => state.meta);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef(null);

  const bookingSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    phone: z.string()
      .min(10, 'Enter 10 digits')
      .max(10, 'Enter 10 digits')
      .regex(/^[0-9]{10}$/, 'Enter valid 10 digits'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    date: z.string().min(1, 'Please select a date'),
    slot: z.string().min(1, 'Please select a time slot'),
    message: z.string().optional(),
  });
  const [slotOpen, setSlotOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [phoneNumber, setPhoneNumber] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeSlots = [
    { value: "morning", label: "Morning (09:00 AM - 12:00 PM)", startTime: "10:00 AM", endTime: "1:00 PM" },
    { value: "afternoon", label: "Afternoon (12:01 PM - 03:00 PM)", startTime: "2:00 PM", endTime: "5:00 PM" },
    { value: "evening", label: "Evening (03:01 PM - 06:00 PM)", startTime: "6:00 PM", endTime: "9:00 PM" }
  ] || meta?.timeSlots?.map(slot => ({
    value: `${slot.startTime}-${slot.endTime}`,
    label: `${slot.startTime} - ${slot.endTime}`,
    startTime: slot.startTime,
    endTime: slot.endTime
  }));

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
    setValue('date', formattedDate);
    setShowCalendar(false);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
      setValue('phone', value);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === currentMonth && 
                     today.getFullYear() === currentYear;
      const isSelected = selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`h-8 sm:h-10 w-full rounded-lg text-xs sm:text-sm transition-colors ${
            isSelected
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : isToday
              ? 'bg-pink-100 text-pink-600 font-semibold hover:bg-pink-200'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const onSubmit = async (data) => {
  const selectedSlot = timeSlots.find(slot => slot.value === data.slot);
  const fullPhoneNumber = `+91${data.phone}`;
  
  const message = `*MSKR GLAMM STUDIO - New Booking Request*

      Client Details : 
        • Name  : ${data.name}
        • Phone : ${fullPhoneNumber}
        • Email : ${data.email || "Not provided"}

      Appointment Details : 
        • Date  : ${data.date}
        • Time Slot : ${selectedSlot?.label || data.slot}

      Special Message : 
        • ${data.message || "None"}

      *Thank you for choosing MSKR GLAMM STUDIO*`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${fullPhoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, "_blank");

  toast.success("Opening WhatsApp...", {
    duration: 3000,
    style: { borderRadius: "12px" },
  });

  reset();
  setSelectedDate('');
  setSelectedSlot('');
  setPhoneNumber('');
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
      
      <div className="grid grid-cols-1 lg:grid-cols-2  gap-3 sm:gap-4">
        <FormField
          register={register('name')}
          placeholder="Full Name *"
          error={errors.name}
        />

        <div>
          <input
            {...register('phone')}
            type="text"
            placeholder="Enter 10 digit mobile number"
            value={phoneNumber}
            onChange={handlePhoneChange}
            maxLength={10}
            className={`w-full p-2.5 sm:p-3 md:p-4 bg-transparent border ${
              errors.phone
                ? 'border-red-400 ring-2 ring-red-100'
                : 'border-gray-200'
            } rounded-xl text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-xs sm:text-sm md:text-base`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <FormField
        register={register('email')}
        placeholder="Email Address (optional)"
        type="email"
        error={errors.email}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative" ref={calendarRef}>
          <div className="relative">
            <input
              {...register('date')}
              type="text"
              placeholder="Select Date *"
              value={selectedDate}
              onFocus={() => setShowCalendar(true)}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setValue('date', e.target.value);
              }}
              className={`w-full p-2.5 sm:p-3 md:p-4 bg-transparent border ${
                errors.date ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200'
              } rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-xs sm:text-sm md:text-base pr-10 cursor-pointer`}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
          </div>
          
          {showCalendar && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-3 sm:p-4 w-64 sm:w-72">
              <div className="flex justify-between items-center mb-3">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-1 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </div>
          )}
          
          {errors.date && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.date.message}</p>
          )}
        </div>
        
        <div className="relative">
          <input
            type="hidden"
            {...register('slot')}
            value={selectedSlot}
          />

          <button
            type="button"
            onClick={() => setSlotOpen(!slotOpen)}
            className={`w-full p-2.5 sm:p-3 md:p-4 bg-transparent border ${
              errors.slot
                ? 'border-red-400 ring-2 ring-red-100'
                : 'border-gray-200'
            } rounded-lg sm:rounded-xl text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-left flex items-center justify-between text-xs sm:text-sm md:text-base`}
          >
            <span className={selectedSlot ? "text-gray-800" : "text-gray-400"}>
              {selectedSlot
                ? timeSlots.find(slot => slot.value === selectedSlot)?.label
                : "Preferred Slot *"}
            </span>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition ${
                  slotOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          {slotOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-pink-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto scrollbar-hide">
              <div className="py-1">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    onClick={() => {
                      setSelectedSlot(slot.value);
                      register('slot').onChange({
                        target: {
                          name: 'slot',
                          value: slot.value
                        }
                      });
                      setSlotOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition-all duration-150 text-xs sm:text-sm md:text-base ${
                      selectedSlot === slot.value
                        ? 'bg-pink-50 text-pink-600 font-medium'
                        : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{slot.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errors.slot && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1">
              {errors.slot.message}
            </p>
          )}
        </div>
      </div>

      <FormField
        register={register('message')}
        placeholder="Any special requests? (optional)"
        type="textarea"
        rows={3}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg sm:rounded-xl py-2.5 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-xs sm:text-sm">Sending...</span>
          </span>
        ) : (
          <span className="text-xs sm:text-sm md:text-base cursor-pointer">Confirm Booking Request</span>
        )}
      </button>
    </form>
  );
};

export default BookingForm;
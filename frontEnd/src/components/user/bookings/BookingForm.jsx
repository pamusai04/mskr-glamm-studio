
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Clock, Phone, Home, MessageSquare, AlertCircle, Loader2, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Wallet, Info, MapPin, Tag, Search } from 'lucide-react';
import { getSlotAvailability, createBooking, clearBookingState } from '../../../redux/slices/bookingSlice';
import { getCart, selectAppliedOffer } from '../../../redux/slices/cartSlice';

const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractStartTime = (slotString) => {
  if (!slotString) return '';
  const [startTime] = slotString.split(' - ');
  return startTime.trim();
};

const convertTo24Hour = (timeStr) => {
  if (!timeStr) return null;
  let hours, minutes, period;
  const [time, modifier] = timeStr.split(' ');
  if (!modifier) return null;
  [hours, minutes] = time.split(':').map(Number);
  period = modifier.toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  return { hours, minutes };
};

const convertTo12Hour = (hours, minutes) => {
  const period = hours >= 12 ? 'PM' : 'AM';
  let displayHours = hours % 12;
  displayHours = displayHours === 0 ? 12 : displayHours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const isSlotBeforeCurrentTime = (slot, selectedDate) => {
  const today = new Date();
  const selectedDateObj = new Date(selectedDate);
  
  if (selectedDateObj.toDateString() === today.toDateString()) {
    const startTime = extractStartTime(slot);
    const [slotTime, modifier] = startTime.split(' ');
    let [hours, minutes] = slotTime.split(':');
    hours = parseInt(hours);
    
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    const slotDateTime = new Date(selectedDateObj);
    slotDateTime.setHours(hours, parseInt(minutes), 0, 0);
    
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
    
    const minBookingTime = new Date(currentTime);
    minBookingTime.setMinutes(minBookingTime.getMinutes() + 30);
    
    return slotDateTime < minBookingTime;
  }
  return false;
};

const bookingSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'Phone number must be exactly 10 digits')
    .max(10, 'Phone number must be exactly 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  serviceDate: z.string().min(1, 'Please select a service date'),
  preferredSlotStart: z.string().min(1, 'Please select a time slot'),
  homeService: z.boolean().optional(),
  locationDetails: z.string().optional(),
  specialRequest: z.string().optional(),
  appliedOfferId: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).superRefine((data, ctx) => {
  if (data.homeService === true && (!data.locationDetails || data.locationDetails.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please provide your location details for home service',
      path: ['locationDetails']
    });
  }
});

const BookingForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slotAvailability, loading, success, error, currentBooking } = useSelector((state) => state.booking);
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const appliedOfferFromStore = useSelector(selectAppliedOffer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualTimeInput, setManualTimeInput] = useState({ hour: '', minute: '', period: 'AM' });
  const [calculatedEndTime, setCalculatedEndTime] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [manualSlots, setManualSlots] = useState([]);
  const [showManualSlots, setShowManualSlots] = useState(false);
  const [isTimeAvailable, setIsTimeAvailable] = useState(null);
  const [matchedRange, setMatchedRange] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlotsForSelectedDate, setAvailableSlotsForSelectedDate] = useState([]);
  const [showChecklist, setShowChecklist] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    serviceDate: '',
    preferredSlotStart: '',
    homeService: false,
    locationDetails: '',
    specialRequest: '',
    appliedOfferId: '',
    termsAccepted: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const calculateTotalDuration = useCallback(() => {
    if (!cart || cart.length === 0) return 0;
    let totalMinutes = 0;
    cart.forEach(item => {
      const durationPerPerson = Number(item.service_id?.duration) || 0;
      const persons = Number(item.numberOfPersons) || 1;
      const itemDuration = durationPerPerson * persons;
      totalMinutes += itemDuration;
    });
    return totalMinutes;
  }, [cart]);

  const totalDuration = calculateTotalDuration();
  const totalDurationWithBuffer = totalDuration + 30;

  useEffect(() => {
    dispatch(getSlotAvailability());
  }, [dispatch]);

  useEffect(() => {
    if (user?.phoneNumber) {
      setFormData(prev => ({ ...prev, phoneNumber: user.phoneNumber }));
    }
  }, [user]);

  useEffect(() => {
    if (appliedOfferFromStore?.offerId) {
      setFormData(prev => ({ ...prev, appliedOfferId: appliedOfferFromStore.offerId }));
    }
  }, [appliedOfferFromStore]);
  
  useEffect(() => {
    if (selectedDate && slotAvailability) {
      const dateStr = formatDateToYYYYMMDD(selectedDate);
      const availabilityArray = Array.isArray(slotAvailability) ? slotAvailability : [];
      const availabilityForDate = availabilityArray.find(item => item.date === dateStr);
      
      if (availabilityForDate && availabilityForDate.available) {
        let availableRanges = [...availabilityForDate.available];
        
        const today = new Date();
        const selectedDateObj = new Date(selectedDate);
        
        if (selectedDateObj.toDateString() === today.toDateString()) {
          const currentTime = new Date();
          currentTime.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
          const minBookingTime = new Date(currentTime);
          minBookingTime.setMinutes(minBookingTime.getMinutes() + 30);
          const minMinutes = minBookingTime.getHours() * 60 + minBookingTime.getMinutes();
          
          availableRanges = availableRanges.filter(range => {
            const [rangeStart, rangeEnd] = range.split(' - ');
            const rangeEnd24 = convertTo24Hour(rangeEnd.trim());
            if (rangeEnd24) {
              const endMinutes = rangeEnd24.hours * 60 + rangeEnd24.minutes;
              return endMinutes > minMinutes;
            }
            return true;
          });
        }
        
        setAvailableSlotsForSelectedDate(availableRanges);
      } else {
        setAvailableSlotsForSelectedDate([]);
      }
    }
  }, [selectedDate, slotAvailability]);

  useEffect(() => {
    if (success && currentBooking) {
      toast.success('Booking created successfully!', {
        duration: 3000,
        position: 'top-center',
      });
      dispatch(clearBookingState());
      setIsSubmitting(false);
      
      setTimeout(() => {
        dispatch(getCart());
        navigate('/booking-history');
      }, 1500);
    }
  }, [success, currentBooking, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      const errorMessage = typeof error === 'string' ? error : 'Booking failed. Please try again.';
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-center',
      });
      dispatch(clearBookingState());
      setIsSubmitting(false);
    }
  }, [error, dispatch]);

  const calculateEndTime = useCallback((startTime12, durationMinutes) => {
    const startTime24 = convertTo24Hour(startTime12);
    if (!startTime24) return null;
    
    const startMinutes = startTime24.hours * 60 + startTime24.minutes;
    const endMinutes = startMinutes + durationMinutes;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    
    return convertTo12Hour(endHours, endMins);
  }, []);

  const generateSlotString = useCallback((startTime12, endTime12) => {
    return `${startTime12} - ${endTime12}`;
  }, []);

  const parseRange = useCallback((rangeStr) => {
    const [rangeStart, rangeEnd] = rangeStr.split(' - ');
    const rangeStart24 = convertTo24Hour(rangeStart.trim());
    const rangeEnd24 = convertTo24Hour(rangeEnd.trim());
    
    if (!rangeStart24 || !rangeEnd24) return null;
    
    let start = rangeStart24.hours * 60 + rangeStart24.minutes;
    let end = rangeEnd24.hours * 60 + rangeEnd24.minutes;
    
    if (end < start) {
      end += 24 * 60;
    }
    
    return { start, end };
  }, []);

  const checkManualTimeAvailability = useCallback(async () => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }
    
    if (!manualTimeInput.hour || !manualTimeInput.minute) {
      toast.error('Please enter a valid time');
      return;
    }
    
    setIsCheckingAvailability(true);
    
    const hour = parseInt(manualTimeInput.hour);
    const minute = parseInt(manualTimeInput.minute);
    
    if (isNaN(hour) || hour < 1 || hour > 12) {
      toast.error('Hour must be between 1 and 12');
      setIsCheckingAvailability(false);
      return;
    }
    
    if (isNaN(minute) || minute < 0 || minute > 59) {
      toast.error('Minute must be between 0 and 59');
      setIsCheckingAvailability(false);
      return;
    }
    
    const startTime12 = `${hour}:${minute.toString().padStart(2, '0')} ${manualTimeInput.period}`;
    const endTime12 = calculateEndTime(startTime12, totalDurationWithBuffer);
    
    if (!endTime12) {
      toast.error('Invalid time calculation');
      setIsCheckingAvailability(false);
      return;
    }
    
    setCalculatedEndTime(endTime12);
    
    const dateStr = formatDateToYYYYMMDD(selectedDate);
    const availabilityArray = Array.isArray(slotAvailability) ? slotAvailability : [];
    const availabilityForDate = availabilityArray.find(item => item.date === dateStr);
    
    if (!availabilityForDate || !availabilityForDate.available) {
      toast.error('No slots available for this date');
      setIsCheckingAvailability(false);
      setIsTimeAvailable(false);
      setMatchedRange(null);
      return;
    }
    
    const startTime24 = convertTo24Hour(startTime12);
    const endTime24 = convertTo24Hour(endTime12);
    
    if (!startTime24 || !endTime24) {
      toast.error('Invalid time format');
      setIsCheckingAvailability(false);
      return;
    }
    
    const startMinutes = startTime24.hours * 60 + startTime24.minutes;
    let endMinutes = endTime24.hours * 60 + endTime24.minutes;
    
    let isAvailable = false;
    let matchedRangeStr = null;
    
    for (const range of availabilityForDate.available) {
      const parsedRange = parseRange(range);
      if (!parsedRange) continue;
      
      let adjustedEndMinutes = endMinutes;
      let adjustedStartMinutes = startMinutes;
      
      if (endMinutes < startMinutes) {
        adjustedEndMinutes = endMinutes + 24 * 60;
      }
      
      if (adjustedStartMinutes >= parsedRange.start && adjustedEndMinutes <= parsedRange.end) {
        isAvailable = true;
        matchedRangeStr = range;
        break;
      }
    }
    
    setIsTimeAvailable(isAvailable);
    setMatchedRange(matchedRangeStr);
    
    if (isAvailable) {
      const requestedSlot = generateSlotString(startTime12, endTime12);
      toast.success('Time slot is available!');
      setManualSlots([requestedSlot]);
      setShowManualSlots(true);
    } else {
      toast.error('Time slot is not available. Please choose another time.');
      setManualSlots([]);
      setShowManualSlots(false);
    }
    
    setIsCheckingAvailability(false);
  }, [selectedDate, manualTimeInput, totalDurationWithBuffer, slotAvailability, calculateEndTime, generateSlotString, parseRange]);

  const handleManualTimeChange = (field, value) => {
    setManualTimeInput(prev => ({ ...prev, [field]: value }));
    setShowManualSlots(false);
    setManualSlots([]);
    setCalculatedEndTime(null);
    setIsTimeAvailable(null);
    setMatchedRange(null);
  };

  const handleManualSlotSelect = (slot) => {
    const startTime = extractStartTime(slot);
    setFormData(prev => ({ ...prev, preferredSlotStart: startTime }));
    setShowManualSlots(false);
    if (errors.preferredSlotStart) {
      setErrors(prev => ({ ...prev, preferredSlotStart: '' }));
    }
    toast.success(`Selected: ${slot}`);
  };

  const validateField = useCallback((name, value, allValues) => {
    try {
      const result = bookingSchema.safeParse(allValues);
      if (!result.success) {
        const fieldError = result.error.errors.find(err => err.path[0] === name);
        return fieldError ? fieldError.message : '';
      }
      return '';
    } catch (error) {
      return '';
    }
  }, []);

  const validateForm = useCallback(() => {
    try {
      const result = bookingSchema.safeParse(formData);
      
      if (!result.success) {
        const newErrors = {};
        result.error.errors.forEach((err) => {
          const path = err.path[0];
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        
        const firstError = result.error.errors[0];
        if (firstError) {
          toast.error(firstError.message, {
            duration: 3000,
            position: 'top-center',
          });
        }
        return false;
      }
      
      setErrors({});
      return true;
    } catch (error) {
      return false;
    }
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      if (name === 'homeService' && !checked) {
        updated.locationDetails = '';
      }
      
      return updated;
    });
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'homeService' && !checked) {
      setErrors(prev => ({ ...prev, locationDetails: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const updatedFormData = { ...formData, [name]: value };
    const error = validateField(name, value, updatedFormData);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, formData]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setShowChecklist(true);
  }, []);

  const confirmSubmission = useCallback(async () => {
    const allTouched = Object.keys(bookingSchema.shape).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      const bookingData = {
        phoneNumber: formData.phoneNumber,
        serviceDate: formData.serviceDate,
        preferredSlotStart: formData.preferredSlotStart,
        homeService: formData.homeService,
        locationDetails: formData.locationDetails,
        specialRequest: formData.specialRequest,
        appliedOfferId: formData.appliedOfferId || undefined
      };
      await dispatch(createBooking(bookingData));
      setShowChecklist(false);
    }
  }, [validateForm, formData, dispatch]);

  const getDaysInMonth = useCallback((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    const remainingDays = 35 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  }, []);

  const getAvailabilityForDate = useCallback((date) => {
    if (!slotAvailability) return null;
    
    const dateStr = formatDateToYYYYMMDD(date);
    const availabilityArray = Array.isArray(slotAvailability) ? slotAvailability : [];
    const availability = availabilityArray.find(item => item.date === dateStr);
    
    if (availability) {
      return {
        availableCount: availability.availableCount || 0,
        isAvailable: (availability.availableCount || 0) > 0,
        availableSlots: availability.available || []
      };
    }
    
    return null;
  }, [slotAvailability]);

  const handleDateSelect = useCallback((date) => {
    const availability = getAvailabilityForDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;
    
    if ((availability && availability.isAvailable && !isPast) || (!availability && !isPast)) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        serviceDate: formatDateToYYYYMMDD(date),
        preferredSlotStart: ''
      }));
      setManualSlots([]);
      setShowManualSlots(false);
      setCalculatedEndTime(null);
      setIsTimeAvailable(null);
      setMatchedRange(null);
      if (errors.serviceDate) {
        setErrors(prev => ({ ...prev, serviceDate: '' }));
      }
    } else if (availability && !availability.isAvailable && !isPast) {
      toast.error('No slots available for this date');
    }
  }, [getAvailabilityForDate, errors.serviceDate]);

  const handleSlotSelect = useCallback((slot) => {
    const startTime = extractStartTime(slot);
    setFormData(prev => ({ ...prev, preferredSlotStart: startTime }));
    if (errors.preferredSlotStart) {
      setErrors(prev => ({ ...prev, preferredSlotStart: '' }));
    }
  }, [errors.preferredSlotStart]);

  const changeMonth = useCallback((increment) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + increment, 1));
  }, []);

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth, getDaysInMonth]);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isSubmitDisabled = useMemo(() => {
    return loading || isSubmitting || 
           !formData.serviceDate || 
           !formData.preferredSlotStart || 
           !formData.termsAccepted || 
           (formData.homeService && !formData.locationDetails);
  }, [loading, isSubmitting, formData.serviceDate, formData.preferredSlotStart, formData.termsAccepted, formData.homeService, formData.locationDetails]);

  const displaySelectedSlot = useMemo(() => {
    if (!formData.preferredSlotStart || !selectedDate) return '';
    
    const endTime = calculateEndTime(formData.preferredSlotStart, totalDurationWithBuffer);
    if (endTime) {
      return `${formData.preferredSlotStart} - ${endTime}`;
    }
    
    const selectedSlotObj = availableSlotsForSelectedDate.find(slot => 
      extractStartTime(slot) === formData.preferredSlotStart
    );
    if (!selectedSlotObj && manualSlots.length > 0) {
      const manualSlot = manualSlots.find(slot => extractStartTime(slot) === formData.preferredSlotStart);
      return manualSlot || formData.preferredSlotStart;
    }
    return selectedSlotObj || formData.preferredSlotStart;
  }, [formData.preferredSlotStart, selectedDate, availableSlotsForSelectedDate, manualSlots, calculateEndTime, totalDurationWithBuffer]);

  return (
    <>
      <div className="bg-white mb-15 lg:mb-0 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
        <div className="bg-linear-to-r from-[#663399] to-[#552888] px-4 sm:px-6 py-4 sm:py-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">Complete Your Booking</h1>
            <p className="text-purple-100 text-xs sm:text-sm">Fill in the details to confirm your appointment</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {appliedOfferFromStore && appliedOfferFromStore.offerId && (
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-green-800">Offer Applied!</p>
                  <p className="text-[10px] sm:text-xs text-green-700 mt-0.5">
                    {appliedOfferFromStore.title} - ₹{appliedOfferFromStore.discountAmount} off
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#663399]" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter 10-digit mobile number"
              maxLength="10"
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 text-sm sm:text-base ${
                errors.phoneNumber && touched.phoneNumber
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-[#663399] focus:ring-purple-200'
              }`}
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {errors.phoneNumber}
              </p>
            )}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#663399]" />
                Select Service Date <span className="text-red-500">*</span>
              </label>
              
              <div className="border-2 border-gray-200 rounded-xl p-2 sm:p-3 bg-white">
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900">
                    {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </h3>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                  </button>
                </div>
                
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-gray-500 py-0.5 sm:py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-0.5">
                  {days.map((day, index) => {
                    const availability = getAvailabilityForDate(day.date);
                    const isSelected = selectedDate && 
                      selectedDate.toDateString() === day.date.toDateString();
                    const isToday = new Date().toDateString() === day.date.toDateString();
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isPast = day.date < today;
                    
                    let isSelectable = day.isCurrentMonth && !isPast;
                    let bgColor = 'bg-white';
                    let textColor = 'text-gray-900';
                    let borderColor = 'border-transparent';
                    
                    if (isPast) {
                      bgColor = 'bg-gray-100';
                      textColor = 'text-gray-400';
                      isSelectable = false;
                    } else if (availability && availability.availableCount === 0 && day.isCurrentMonth) {
                      bgColor = 'bg-red-500';
                      textColor = 'text-white';
                      isSelectable = false;
                    } else if (availability && availability.isAvailable && day.isCurrentMonth) {
                      bgColor = 'bg-green-500';
                      textColor = 'text-white';
                      isSelectable = true;
                    } else if (!day.isCurrentMonth) {
                      bgColor = 'bg-white';
                      textColor = 'text-gray-400';
                      isSelectable = false;
                    }
                    
                    if (isSelected) {
                      bgColor = 'bg-[#663399]';
                      textColor = 'text-white';
                    } else if (isToday && !isPast && availability?.availableCount > 0) {
                      borderColor = 'border-[#663399]';
                    }
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateSelect(day.date)}
                        disabled={!isSelectable}
                        className={`
                          relative p-1 sm:p-1.5 rounded-md transition-all
                          ${bgColor} ${textColor} border-2 ${borderColor}
                          ${isSelectable ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed opacity-60'}
                          focus:outline-none focus:ring-1 focus:ring-purple-200
                        `}
                      >
                        <div className="text-center">
                          <span className="text-[10px] sm:text-xs font-medium">{day.date.getDate()}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                    <span className="text-[9px] sm:text-xs text-gray-500">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                    <span className="text-[9px] sm:text-xs text-gray-500">Fully Booked</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gray-300"></div>
                    <span className="text-[9px] sm:text-xs text-gray-500">Past Date</span>
                  </div>
                </div>
              </div>
              
              {errors.serviceDate && touched.serviceDate && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {errors.serviceDate}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#663399]" />
                Select Time Slot <span className="text-red-500">*</span>
              </label>
              
              {selectedDate ? (
                <div className="space-y-3">
                 
                  <div className="flex gap-2">
                    
                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Hour"
                        value={manualTimeInput.hour}
                        onChange={(e) => handleManualTimeChange('hour', e.target.value)}
                        className="w-full h-11 px-3 border-2 border-gray-200 rounded-lg focus:border-[#663399] focus:ring-2 focus:ring-purple-200 outline-none text-center text-gray-900 placeholder-gray-400 text-sm"
                        min="1"
                        max="12"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 text-center">
                        Hour (1-12)
                      </p>
                    </div>

                    <div className="h-11 flex items-center justify-center px-1">
                      <span className="text-xl font-bold text-gray-500">:</span>
                    </div>

                    <div className="flex-1">
                      <input
                        type="number"
                        placeholder="Minute"
                        value={manualTimeInput.minute}
                        onChange={(e) => handleManualTimeChange('minute', e.target.value)}
                        className="w-full h-11 px-3 border-2 border-gray-200 rounded-lg focus:border-[#663399] focus:ring-2 focus:ring-purple-200 outline-none text-center text-gray-900 placeholder-gray-400 text-sm"
                        min="0"
                        max="59"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 text-center">
                        Minute (0-59)
                      </p>
                    </div>

                    <div className="flex-1">
                      <select
                        value={manualTimeInput.period}
                        onChange={(e) =>
                          handleManualTimeChange('period', e.target.value)
                        }
                        className="w-full h-11 px-3 border-2 border-gray-200 rounded-lg focus:border-[#663399] focus:ring-2 focus:ring-purple-200 outline-none bg-white text-gray-900 text-sm"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                      <p className="text-[10px] text-gray-500 mt-1 text-center">
                        AM/PM
                      </p>
                    </div>

                  </div>

                  {totalDuration > 0 && (
                    <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-800">
                        ⏱️ Your service will take approximately <span className="font-bold">{totalDuration} minutes</span>
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        <span className="font-medium">✨ Extra time included:</span> We've added 30 minutes for preparation and setup.
                      </p>
                      <p className="text-xs text-purple-700">
                        <strong>Total time needed:</strong> {totalDurationWithBuffer} minutes
                      </p>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={checkManualTimeAvailability}
                    disabled={isCheckingAvailability || !manualTimeInput.hour || !manualTimeInput.minute}
                    className="w-full bg-linear-to-r from-[#663399] to-[#552888] text-white py-2.5 rounded-lg font-semibold hover:from-[#552888] hover:to-[#442277] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isCheckingAvailability ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking Availability...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Check Availability
                      </>
                    )}
                  </button>
                  
                  {calculatedEndTime && (
                    <div className={`p-2.5 rounded-lg border ${
                      isTimeAvailable === true 
                        ? 'bg-green-50 border-green-200' 
                        : isTimeAvailable === false 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <p className={`text-sm ${
                        isTimeAvailable === true 
                          ? 'text-green-800' 
                          : isTimeAvailable === false 
                          ? 'text-red-800' 
                          : 'text-blue-800'
                      }`}>
                        📍 Your appointment will be from <span className="font-bold">{`${manualTimeInput.hour}:${manualTimeInput.minute.toString().padStart(2, '0')} ${manualTimeInput.period}`}</span> to <span className="font-bold">{calculatedEndTime}</span>
                      </p>
                      <p className={`text-xs mt-1 ${
                        isTimeAvailable === true 
                          ? 'text-green-600' 
                          : isTimeAvailable === false 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`}>
                        Total duration: {totalDurationWithBuffer} minutes
                        {isTimeAvailable === true && matchedRange && ` ✓ Available within ${matchedRange}`}
                        {isTimeAvailable === false && ' ✗ Not available - Please choose another time'}
                      </p>
                    </div>
                  )}
                  
                  {showManualSlots && manualSlots.length > 0 && (
                    <div className="border-2 border-green-300 rounded-xl bg-green-50 max-h-48 overflow-y-auto">
                      <div className="p-3">
                        <p className="text-xs font-bold text-green-800 mb-2">✅ Available Time Slot:</p>
                        <div className="space-y-1.5">
                          {manualSlots.map((slot, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleManualSlotSelect(slot)}
                              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                                formData.preferredSlotStart === extractStartTime(slot)
                                  ? 'bg-[#663399] text-white'
                                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-green-300'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-xl bg-gray-100 p-4 sm:p-6 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-1.5 sm:mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500">Select a date first</p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Choose from the calendar on the left</p>
                  </div>
                </div>
              )}
              
              {errors.preferredSlotStart && touched.preferredSlotStart && (
                <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {errors.preferredSlotStart}
                </p>
              )}
            </div>
          </div>
          
          {!showManualSlots && availableSlotsForSelectedDate.length > 0 && selectedDate && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#663399]" />
                Available Time Ranges
              </label>
              <div className="border-2 border-gray-200 rounded-xl bg-white max-h-48 overflow-y-auto">
                <div className="p-3 space-y-1.5">
                  {availableSlotsForSelectedDate.map((range, index) => (
                    <div key={index} className="p-3 rounded-lg border-2 border-green-200 bg-green-50">
                      <p className="text-xs font-semibold text-green-800">Available: {range}</p>
                      <p className="text-[10px] text-green-600 mt-1">💡 Pick any start time within this range</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="homeService"
                checked={formData.homeService}
                onChange={handleChange}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#663399] rounded border-gray-300 focus:ring-[#663399] cursor-pointer"
              />
              <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 group-hover:text-[#663399] transition-colors">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium">Request Home Service</span>
              </span>
            </label>
            {formData.homeService && (
              <>
                <div className="mt-2 ml-5 sm:ml-6 p-1.5 sm:p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-[10px] sm:text-xs text-gray-600">
                    Our professional will visit your location at {displaySelectedSlot || 'the selected time'}. Additional charges may apply based on your location.
                  </p>
                </div>
                
                <div className="mt-2 sm:mt-3 ml-5 sm:ml-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#663399]" />
                    Location Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="locationDetails"
                    value={formData.locationDetails}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    rows={3}
                    placeholder="Enter your full address, landmark, city, and pincode"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-900 placeholder-gray-400 text-xs sm:text-sm resize-none ${
                      errors.locationDetails && touched.locationDetails
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-[#663399] focus:ring-purple-200'
                    }`}
                  />
                  {errors.locationDetails && touched.locationDetails && (
                    <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {errors.locationDetails}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 sm:mr-2 text-[#663399]" />
              Special Request (Optional)
            </label>
            <textarea
              name="specialRequest"
              value={formData.specialRequest}
              onChange={handleChange}
              rows={2}
              placeholder="Any specific requirements or instructions..."
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#663399] focus:ring-2 focus:ring-purple-200 transition-all resize-none text-gray-900 placeholder-gray-400 text-xs sm:text-sm"
            />
          </div>
          
          <div>
            <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#663399] rounded border-gray-300 focus:ring-[#663399] cursor-pointer mt-0.5"
              />
              <span className="text-xs sm:text-sm text-gray-700 group-hover:text-[#663399] transition-colors">
                I agree to the Terms & Conditions and Privacy Policy
              </span>
            </label>
            {errors.termsAccepted && touched.termsAccepted && (
              <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {errors.termsAccepted}
              </p>
            )}
          </div>
          
          <div className="space-y-2 sm:space-y-3 pt-1.5 sm:pt-2">
            <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-blue-800">Payment Information</p>
                  <p className="text-[9px] sm:text-xs text-blue-700 mt-1">
                    💳 50% advance payment required after booking confirmation
                  </p>
                  <p className="text-[9px] sm:text-xs text-blue-700 mt-1">
                    💰 Remaining 50% to be paid at the time of service
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full bg-linear-to-r from-[#663399] to-[#552888] text-white py-2.5 sm:py-3 rounded-xl font-semibold hover:from-[#552888] hover:to-[#442277] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md sm:shadow-lg hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
          >
            {(loading || isSubmitting) ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                Processing Booking...
              </>
            ) : (
              <>
                Confirm Booking
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </>
            )}
          </button>
        </form>
      </div>
      
      {showChecklist && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-linear-to-r from-[#663399] to-[#552888] px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl sm:rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-white">Confirm Your Booking</h3>
            </div>
            
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">Please verify all details before confirming:</p>
              
              <div className="space-y-2 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  {formData.phoneNumber && formData.phoneNumber.length === 10 ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Phone Number: <span className="font-semibold">{formData.phoneNumber || 'Not provided'}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {formData.serviceDate ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Service Date: <span className="font-semibold">{formData.serviceDate || 'Not selected'}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {formData.preferredSlotStart ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <span className="text-xs sm:text-sm text-gray-700">
                    Time Slot: <span className="font-semibold">{displaySelectedSlot || 'Not selected'}</span>
                  </span>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span className="text-xs sm:text-sm text-gray-700">
                    Home Service: <span className="font-semibold">{formData.homeService ? 'Yes' : 'No'}</span>
                  </span>
                </div>

                {appliedOfferFromStore && appliedOfferFromStore.offerId && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    <span className="text-xs sm:text-sm text-gray-700">
                      Offer Applied: <span className="font-semibold text-green-600">{appliedOfferFromStore.title}</span>
                      <span className="text-gray-500 ml-1">(-₹{appliedOfferFromStore.discountAmount})</span>
                    </span>
                  </div>
                )}
                
                {formData.homeService && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    {formData.locationDetails ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="text-xs sm:text-sm text-gray-700">
                      <span className="font-semibold">Location Details:</span>
                      <p className="mt-1 text-gray-600 whitespace-pre-wrap text-xs sm:text-sm">{formData.locationDetails || 'Not provided'}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-blue-800">Payment Reminder</p>
                    <p className="text-[9px] sm:text-xs text-blue-700 mt-1">
                      💳 50% advance payment required after booking confirmation
                    </p>
                    <p className="text-[9px] sm:text-xs text-blue-700 mt-1">
                      💰 Remaining 50% to be paid at the time of service
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 pt-0">
              <button
                type="button"
                onClick={() => setShowChecklist(false)}
                className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSubmission}
                disabled={isSubmitDisabled}
                className="flex-1 bg-[#663399] text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#552888] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin inline mr-1.5 sm:mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingForm;
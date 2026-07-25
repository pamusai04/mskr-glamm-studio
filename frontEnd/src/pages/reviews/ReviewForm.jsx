import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  X, 
  Link as LinkIcon,
  AlertCircle,
  Search,
  ChevronDown,
  Calendar,
  Clock,
  CheckCircle,
  Loader
} from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getBookingHistory } from '../../redux/slices/bookingSlice';
import { sendReview, clearSuccess, resetReviewState } from '../../redux/slices/reviewSlice';
import AdminLoading from '../../common/AdminLoading'; 

const reviewSchema = z.object({
  selectedService: z.string().min(1, "Please select a service"),
  rating: z.number().min(1, "Please select a rating").max(5),
  reviewText: z.string().min(10, "Review must be at least 10 characters").max(1000, "Review cannot exceed 1000 characters"),
  reviewImage: z.string().url("Invalid image URL").optional().nullable()
});

const Review = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading: bookingsLoading } = useSelector((state) => state.booking);
  const { submitting, success, error, successMessage } = useSelector((state) => state.review);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedServiceName, setSelectedServiceName] = useState('');
  const [selectedServiceImage, setSelectedServiceImage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  const formatSlot = (slot) => {
    if (!slot) return 'N/A';
    if (typeof slot === 'string') return slot;
    if (typeof slot === 'object') {
      if (slot.fullSlot) return slot.fullSlot;
      return `${slot.startTime || ''} - ${slot.endTime || ''}`.trim() || 'N/A';
    }
    return 'N/A';
  };
  
  useEffect(() => {
    dispatch(getBookingHistory());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(successMessage || 'Review submitted successfully!');
      
      dispatch(clearSuccess());
      dispatch(resetReviewState());
      
      setRating(0);
      setReviewText('');
      setSelectedService('');
      setSelectedServiceName('');
      setSelectedServiceImage('');
      setSelectedImage(null);
      setImagePreview(null);
      setImageUrl('');
      setShowUrlInput(false);
      setSearchTerm('');
      setValidationErrors({});
      
      setTimeout(() => {
        navigate('/reviews');
      }, 2000);
    }
  }, [success, successMessage, dispatch, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error?.message || 'Failed to submit review. Please try again.');
    }
  }, [error]);

  const handleBrowseServices = () => {
    navigate('/services');
  };

  const getCompletedServices = () => {
    const completedServices = [];
    
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.serviceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isCompleted = booking.status !== 'cancelled' && bookingDate < today;
      
      if (isCompleted && booking.serviceItemIds && booking.serviceItemIds.length > 0) {
        booking.serviceItemIds.forEach(service => {
          const formattedSlot = formatSlot(booking.preferredSlot);
          
          completedServices.push({
            id: service._id || service.id,
            name: service.name,
            serviceImage: service.serviceImage,
            bookingId: booking._id,
            bookingDate: booking.serviceDate,
            bookingSlot: formattedSlot,
            status: booking.status
          });
        });
      }
    });
    
    return completedServices;
  };
  
  const completedServices = getCompletedServices();
  
  const uniqueServices = completedServices.reduce((acc, current) => {
    const exists = acc.find(item => item.id === current.id);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);
  
  const filteredServices = uniqueServices.filter(service => {
    if (!searchTerm.trim()) return true;
    return service.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleServiceSelect = (service) => {
    setSelectedService(service.id);
    setSelectedServiceName(service.name);
    setSelectedServiceImage(service.serviceImage || '');
    setSearchTerm(service.name);
    setIsDropdownOpen(false);
    setValidationErrors(prev => ({ ...prev, selectedService: undefined }));
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);
    
    if (value === '') {
      setSelectedService('');
      setSelectedServiceName('');
      setSelectedServiceImage('');
    }
  };
  
  const handleUrlUpload = () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }
    
    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))/i;
    if (!urlPattern.test(imageUrl)) {
      toast.error('Please enter a valid image URL (jpg, png, gif, webp, svg)');
      return;
    }
    
    setImagePreview(imageUrl);
    setSelectedImage(imageUrl);
    setImageUrl('');
    setShowUrlInput(false);
    toast.success('Image loaded successfully!');
  };
  
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageUrl('');
    setShowUrlInput(false);
  };
  
  const validateForm = () => {
    try {
      reviewSchema.parse({
        selectedService,
        rating,
        reviewText,
        reviewImage: selectedImage
      });
      setValidationErrors({});
      return true;
    } catch (err) {
      const errors = {};
      err.errors.forEach((error) => {
        errors[error.path[0]] = error.message;
      });
      setValidationErrors(errors);
      
      if (errors.selectedService) toast.error(errors.selectedService);
      else if (errors.rating) toast.error(errors.rating);
      else if (errors.reviewText) toast.error(errors.reviewText);
      else if (errors.reviewImage) toast.error(errors.reviewImage);
      
      return false;
    }
  };
  
  const handleSubmitReview = async () => {
    if (!validateForm()) return;
    
    const reviewData = {
      serviceName: selectedServiceName,
      serviceImage: selectedServiceImage,
      rating: rating,
      reviewMessage: reviewText,
      reviewImage: selectedImage
    };
    
    dispatch(sendReview(reviewData));
  };

  if (bookingsLoading && !bookings.length) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white flex items-center justify-center">
        <AdminLoading text="Loading your bookings" icon={Calendar} color="cyan" />
      </div>
    );
  }
  
  const selectedServiceInfo = uniqueServices.find(s => s.id === selectedService);
  
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Share Your Experience
          </h1>
          <p className="text-lg text-gray-600">
            Review services you've completed with us
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select a Completed Service *
              </label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Search for a service you've completed..."
                    className={`w-full pl-10 pr-10 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent transition-all duration-200 ${
                      validationErrors.selectedService ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <ChevronDown 
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    size={18} 
                  />
                </div>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleServiceSelect(service)}
                          className={`w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-0 ${
                            selectedService === service.id ? 'bg-purple-50 border-l-4 border-l-[#663399]' : ''
                          }`}
                        >
                          {service.serviceImage && (
                            <img src={service.serviceImage} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{service.name}</p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {service.bookingDate
                                    ? new Date(service.bookingDate).toLocaleDateString()
                                    : 'N/A'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{service.bookingSlot}</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-green-600 font-medium">Completed</span>
                              </div>
                            </div>
                          </div>
                          {selectedService === service.id && (
                            <div className="w-2 h-2 bg-[#663399] rounded-full"></div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-gray-500 text-sm">
                          {uniqueServices.length === 0 
                            ? "You haven't completed any services yet. Complete a service to leave a review!"
                            : `No services found matching "${searchTerm}"`}
                        </p>
                        {uniqueServices.length === 0 && (
                          <button
                            onClick={handleBrowseServices}
                            className="mt-3 px-4 py-2 bg-[#663399] text-white rounded-lg hover:bg-[#552988] transition-colors text-sm"
                          >
                            Browse Services
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {validationErrors.selectedService && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.selectedService}</p>
              )}
              
              {selectedService && selectedServiceInfo && (
                <div className="mt-4 p-4 bg-linear-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Service:</p>
                  <div className="flex items-center gap-3">
                    {selectedServiceImage && (
                      <img
                        src={selectedServiceImage}
                        alt={selectedServiceInfo.name}
                        className="w-16 h-16 object-cover rounded-lg border-2 border-[#663399] shadow-sm"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{selectedServiceInfo.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{selectedServiceInfo.bookingDate ? new Date(selectedServiceInfo.bookingDate).toLocaleDateString() : 'N/A'}</span>
                        <Clock className="w-3 h-3 ml-1" />
                        <span>{selectedServiceInfo.bookingSlot}</span>
                        <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                        <span className="text-green-600">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setValidationErrors(prev => ({ ...prev, rating: undefined }));
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2 font-medium">
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent!'}
              </p>
              {validationErrors.rating && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.rating}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  setValidationErrors(prev => ({ ...prev, reviewText: undefined }));
                }}
                rows="4"
                placeholder="Share your experience with this service..."
                className={`w-full px-4 py-2.5 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent resize-none transition-all duration-200 ${
                  validationErrors.reviewText ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.reviewText && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.reviewText}</p>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Photo (Optional)
              </label>
              
              {!imagePreview ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#663399] hover:bg-purple-50 transition-all duration-200"
                  >
                    <LinkIcon size={20} className="text-gray-500" />
                    <span className="text-gray-600">Add Image from URL</span>
                  </button>
                  
                  {showUrlInput && (
                    <div className="space-y-3 animate-fadeIn">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent transition-all duration-200"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleUrlUpload}
                          className="flex-1 bg-[#663399] text-white px-4 py-2.5 rounded-lg hover:bg-[#552988] transition-colors font-medium"
                        >
                          Load Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowUrlInput(false);
                            setImageUrl('');
                          }}
                          className="px-4 py-2.5 border text-gray-600 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative animate-fadeIn">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    onError={() => {
                      toast.error('Failed to load image. Please check the URL.');
                      removeImage();
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              {validationErrors.reviewImage && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.reviewImage}</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full bg-[#663399] text-white py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-[#552988] transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
        
        <div className="mt-8 mb-5 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="text-yellow-600 shrink-0" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-800">Review Guidelines</h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Only completed services can be reviewed</li>
                <li>• Be specific about your experience</li>
                <li>• Focus on the service quality and results</li>
                <li>• Photos help others visualize the results</li>
                <li>• Keep reviews respectful and constructive</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
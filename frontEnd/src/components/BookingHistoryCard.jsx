import React, { memo, useState } from 'react';
import { Calendar, Clock, MapPin, Home, Building2, Users, Package, Eye, RefreshCw, XCircle, ShoppingBag, X, ChevronDown, ChevronUp, Gift, Percent, Tag } from 'lucide-react';

const ActionModal = ({ isOpen, onClose, title, message, actionType }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (actionType) {
      case 'reschedule':
        return <RefreshCw className="w-12 h-12 text-blue-500" />;
      case 'cancel':
        return <XCircle className="w-12 h-12 text-red-500" />;
      case 'view':
        return <Eye className="w-12 h-12 text-purple-500" />;
      default:
        return <Package className="w-12 h-12 text-gray-500" />;
    }
  };

  const getButtonColor = () => {
    switch (actionType) {
      case 'reschedule':
        return 'bg-[#663399] hover:bg-[#552a80]';
      case 'cancel':
        return 'bg-red-500 hover:bg-red-600';
      case 'view':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-in zoom-in">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            <button
              onClick={onClose}
              className={`w-full px-6 py-3 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 ${getButtonColor()}`}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingHistoryCard = memo(({ booking }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    actionType: ''
  });
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const calculateTotalDuration = () => {
    if (!booking.serviceItemIds || booking.serviceItemIds.length === 0) return 0;
    let totalMinutes = 0;
    booking.serviceItemIds.forEach(item => {
      const duration = item.duration || 30;
      const persons = item.numberOfPersons || 1;
      totalMinutes += duration * persons;
    });
    return totalMinutes;
  };

  const totalDuration = calculateTotalDuration();
  const totalDurationWithBuffer = totalDuration + 30;

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBookingType = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const serviceDate = new Date(booking.serviceDate);
    serviceDate.setHours(0, 0, 0, 0);
    
    if (booking.status === 'cancelled') return 'cancelled';
    if (serviceDate < today) return 'past';
    return 'upcoming';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${day} ${month} ${year}, ${hours}:${minutesStr} ${ampm}`;
  };

  const getTotalItems = () => {
    return booking.serviceItemIds?.length || 0;
  };

  const getTotalPersons = () => {
    return booking.serviceItemIds?.reduce((sum, item) => sum + (item.numberOfPersons || 1), 0) || 0;
  };

  const getDiscountDisplay = () => {
    if (!booking.appliedOffer?.offerId) return null;
    const offer = booking.appliedOffer;
    if (offer.offerType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `₹${offer.discountValue} OFF`;
  };

  const handleReschedule = () => {
    setModalConfig({
      title: 'Reschedule Booking',
      message: 'Reschedule functionality is not implemented yet. This feature will be available soon.',
      actionType: 'reschedule'
    });
    setModalOpen(true);
  };

  const handleCancel = () => {
    setModalConfig({
      title: 'Cancel Booking',
      message: 'Cancel functionality is not implemented yet. This feature will be available soon.',
      actionType: 'cancel'
    });
    setModalOpen(true);
  };

  const handleRebook = () => {
    setModalConfig({
      title: 'Book Again',
      message: 'Book again functionality is not implemented yet. This feature will be available soon.',
      actionType: 'reschedule'
    });
    setModalOpen(true);
  };

  const handleViewDetails = () => {
    setModalConfig({
      title: 'View Details',
      message: 'View details functionality is not implemented yet. This feature will be available soon.',
      actionType: 'view'
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  const bookingType = getBookingType();
  const hasOffer = booking.appliedOffer?.offerId && booking.appliedOffer.discountAmount > 0;
  const originalAmount = hasOffer ? booking.totalAmount + booking.appliedOffer.discountAmount : booking.totalAmount;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Booking #{booking._id?.slice(-8) || 'N/A'}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Booked on {booking.bookedDate ? formatDateTime(booking.bookedDate) : 'N/A'}
                </p>
              </div>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
              {booking.status || 'Pending'}
            </span>
          </div>

          {booking.cancellationReason && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-700">Cancellation Reason</h4>
                  <p className="text-sm text-red-600 mt-1">{booking.cancellationReason}</p>
                </div>
              </div>
            </div>
          )}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-3 w-1/3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Service Date</span>
                    </div>
                   </td>
                  <td className="py-3 w-2/3">
                    <span className="font-semibold text-gray-900">
                      {booking.serviceDate ? formatDate(booking.serviceDate) : 'N/A'}
                    </span>
                   </td>
                 </tr>
                
                <tr className="border-b border-gray-200">
                  <td className="py-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Time Slot</span>
                    </div>
                   </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-900">
                      {booking.preferredSlot?.fullSlot || `${booking.preferredSlot?.startTime} - ${booking.preferredSlot?.endTime}` || 'N/A'}
                    </span>
                   </td>
                 </tr>
                
                
                {totalDuration > 0 && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Duration</span>
                      </div>
                      </td>
                    <td className="py-3">
                      <span className="font-semibold text-gray-900">
                        {totalDuration} min service + 30 Preparation Time = {totalDurationWithBuffer} min total
                      </span>
                      </td>
                   </tr>
                )}
                
                <tr className="border-b border-gray-200">
                  <td className="py-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      {booking.homeService ? (
                        <Home className="w-4 h-4" />
                      ) : (
                        <Building2 className="w-4 h-4" />
                      )}
                      <span className="font-medium">Service Type</span>
                    </div>
                    </td>
                  <td className="py-3">
                    <span className="font-semibold text-gray-900">
                      {booking.homeService ? '🏠 Home Service' : '🏢 In-Studio'}
                    </span>
                    </td>
                 </tr>
                
                {booking.homeService && booking.locationDetails && (
                  <tr className="border-b border-gray-200">
                    <td className="py-3 align-top">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Location</span>
                      </div>
                      </td>
                    <td className="py-3">
                      <span className="font-semibold text-gray-900">
                        {booking.locationDetails}
                      </span>
                      </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <button
              onClick={toggleServices}
              className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 group"
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#663399]" />
                <h4 className="text-sm font-semibold text-gray-700">
                  Services Booked ({getTotalItems()} items)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {isServicesOpen ? 'Hide' : 'Show'}
                </span>
                {isServicesOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" />
                )}
              </div>
            </button>
            
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isServicesOpen ? 'max-h-96 mt-3' : 'max-h-0'
              }`}
            >
              <div className="space-y-3 h-60 overflow-y-auto overscroll-contain pr-1 custom-scrollbar smooth-scroll">
                {booking.serviceItemIds?.map((service, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-3 p-3 rounded-xl bg-linear-to-r from-[#F3E8FF] to-[#F9F0FF] border border-[#D9B8FF] transition-all duration-200 hover:shadow-md"
                  >
                    {service.serviceImage && (
                      <div className="w-14 h-14 shrink-0">
                        <img 
                          src={service.serviceImage} 
                          alt={service.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Service'}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{service.name}</p>
                      <div className="flex items-center gap-2 mt-1 mb-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-600">
                          {service.numberOfPersons} {service.numberOfPersons === 1 ? 'person' : 'people'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {service.duration} min × {service.numberOfPersons} = {service.duration * service.numberOfPersons} min
                        </p>
                      </div>
                      <p className="text-[#336699] font-semibold text-sm">
                        ₹{(service.price * service.numberOfPersons).toLocaleString('en-IN')}
                      </p>
                      
                    </div>
                  </div>
                ))}
                
                {booking.serviceItemIds?.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No services in this booking</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasOffer && (
            <div className="mb-4 p-3 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                    <Gift className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800 truncate">{booking.appliedOffer.title}</p>
                    <p className="text-xs text-green-600 truncate">{booking.appliedOffer.description}</p>
                  </div>
                </div>
                
                <div className="hidden sm:block w-px h-8 bg-green-200"></div>
                
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="flex items-center gap-1 sm:justify-end">
                    <span className="text-sm font-bold text-green-700">
                      {getDiscountDisplay()}
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    Saved: ₹{booking.appliedOffer.discountAmount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Services</p>
                  <p className="text-sm font-semibold text-gray-900">{getTotalItems()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total People</p>
                  <p className="text-sm font-semibold text-gray-900">{getTotalPersons()}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Duration</p>
                  <p className="text-sm font-semibold text-gray-900">{totalDuration} min</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 font-bold">Total Amount</span>
                <div className="text-right">
                  {hasOffer && (
                    <p className="text-xs text-gray-400 line-through">
                      ₹{originalAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                  <span className="text-[#663399] font-bold text-base">
                    ₹{booking.totalAmount?.toLocaleString('en-IN') || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 flex-wrap">
            {bookingType === 'upcoming' && booking.status !== 'cancelled' && (
              <>
                <button
                  onClick={handleReschedule}
                  className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-[#663399] to-[#4A2373] hover:from-[#4A2373] hover:to-[#331A4D] text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reschedule</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium border border-red-200"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            )}
            {bookingType === 'past' && booking.status !== 'cancelled' && (
              <button
                onClick={handleRebook}
                className="flex-1 flex items-center justify-center gap-2 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Book Again</span>
              </button>
            )}
            <button
              onClick={handleViewDetails}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium border border-gray-200"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>

      <ActionModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        actionType={modalConfig.actionType}
      />
    </>
  );
});

BookingHistoryCard.displayName = 'BookingHistoryCard';

export default BookingHistoryCard;
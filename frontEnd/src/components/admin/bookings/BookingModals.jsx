import React, { memo, useEffect } from 'react';
import { X, Users, Calendar, Gift, Tag, Percent } from 'lucide-react';
import { BOOKING_STATUS_CONFIG } from '../../../utils/constants';

const StatusBadge = memo(({ status }) => {
  const config = BOOKING_STATUS_CONFIG[status];
  if (!config) return null;
  
  return (
    <span className={`px-2 py-1 inline-flex items-center gap-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
});

const CancelModal = memo(({ 
  isOpen, 
  reason, 
  onReasonChange, 
  onConfirm, 
  onClose, 
  isUpdating 
}) => {
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Cancel Booking</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4">
          <p className="text-sm sm:text-base text-gray-600">Please provide a reason for cancellation:</p>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter cancellation reason..."
            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400 resize-none"
            rows="3"
            autoFocus
          />
        </div>
        
        <div className="flex gap-3 p-4 sm:p-6 pt-0">
          <button
            onClick={onConfirm}
            disabled={isUpdating || !reason.trim()}
            className="flex-1 px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

const DetailsModal = memo(({ booking, onClose, onStatusUpdate, isUpdating }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  if (!booking) return null;
  
  const getDiscountDisplay = () => {
    if (!booking.appliedOffer?.offerId) return null;
    const offer = booking.appliedOffer;
    if (offer.offerType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `₹${offer.discountValue} OFF`;
  };
  
  const getSlotDisplay = () => {
    if (typeof booking.preferredSlot === 'object') {
      return booking.preferredSlot.fullSlot || `${booking.preferredSlot.startTime} - ${booking.preferredSlot.endTime}`;
    }
    return booking.preferredSlot;
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-lg z-10 px-4 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Booking Details</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Users className="w-4 h-4" />
              Customer Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Full Name</label>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{booking.fullName}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Email</label>
                <p className="text-sm sm:text-base text-gray-700">{booking.emailId}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Phone</label>
                <p className="text-sm sm:text-base text-gray-900">{booking.phoneNumber}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Booking ID</label>
                <p className="text-xs sm:text-sm text-gray-600 font-mono">{booking.booking_id}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Service Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Service Date</label>
                <p className="text-sm sm:text-base text-gray-900 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(booking.serviceDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Time Slot</label>
                <p className="text-sm sm:text-base text-gray-900">{getSlotDisplay()}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Service Type</label>
                <p className="text-sm sm:text-base text-gray-900">
                  {booking.homeService ? (
                    <span className="inline-flex items-center gap-1">🏠 Home Service</span>
                  ) : 'Studio Service'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Status</label>
                <div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            </div>
            
            {booking.homeService && booking.locationDetails && (
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-500">Location Details</label>
                <p className="text-sm sm:text-base text-gray-900 mt-1">{booking.locationDetails}</p>
              </div>
            )}
            
            {booking.specialRequest && (
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-500">Special Request</label>
                <p className="text-sm sm:text-base text-gray-700 mt-1 italic">"{booking.specialRequest}"</p>
              </div>
            )}
          </div>
          
          {booking.serviceItemIds?.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Services Booked</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {booking.serviceItemIds.map((item, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 flex flex-row items-start sm:items-center gap-3 p-3 rounded-lg">
                    {item.serviceImage && (
                      <div className="w-12 h-12 shrink-0">
                        <img 
                          src={item.serviceImage} 
                          alt={item.name}
                          className="w-full h-full rounded-lg object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Persons: {item.numberOfPersons || 1}</p>
                    </div>
                    <p className="text-sm font-semibold text-cyan-600 shrink-0">
                      ₹{(item.price * (item.numberOfPersons || 1)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              
              {booking.appliedOffer?.offerId && booking.appliedOffer.discountAmount > 0 && (
                <div className="mt-3 p-3 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                      <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                        <Gift className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-800 truncate">{booking.appliedOffer.title}</p>
                        <p className="text-xs text-green-600 truncate">{booking.appliedOffer.description}</p>
                      </div>
                    </div>
                    
                    <div className="hidden sm:block w-px h-10 bg-green-200"></div>
                    
                    <div className="flex sm:block items-center justify-between gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-1 sm:justify-end">
                        {booking.appliedOffer.offerType === 'percentage' ? (
                          <Percent className="w-3 h-3 text-green-600" />
                        ) : (
                          <Tag className="w-3 h-3 text-green-600" />
                        )}
                        <span className="text-sm font-bold text-green-700">
                          {getDiscountDisplay()}
                        </span>
                      </div>
                      <p className="text-xs text-green-600">
                        Saved: ₹{booking.appliedOffer.discountAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                <p className="text-sm font-bold text-gray-900">Total Amount</p>
                <div className="text-right">
                  {booking.appliedOffer?.discountAmount > 0 && (
                    <p className="text-xs text-gray-400 line-through">
                      ₹{(booking.totalAmount + booking.appliedOffer.discountAmount).toLocaleString()}
                    </p>
                  )}
                  <p className="text-base sm:text-lg font-bold text-cyan-600">
                    ₹{booking.totalAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {booking.cancellationReason && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <label className="text-xs font-medium text-red-600">Cancellation Reason</label>
              <p className="text-sm sm:text-base text-red-800 mt-1">{booking.cancellationReason}</p>
            </div>
          )}
        </div>
        
        <div className="sticky bottom-0 bg-white rounded-b-lg px-4 sm:px-6 py-4 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm sm:text-base bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Close
            </button>
            {booking.status === 'pending' && (
              <button
                onClick={() => {
                  onStatusUpdate(booking.booking_id, 'confirmed');
                  onClose();
                }}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Confirming...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const BookingModals = memo(({
  selectedBooking,
  cancellingId,
  cancellationReason,
  updatingStatus,
  onCloseDetails,
  onCloseCancel,
  onReasonChange,
  onConfirmCancel,
  onStatusUpdate
}) => {
  return (
    <>
      <DetailsModal
        booking={selectedBooking}
        onClose={onCloseDetails}
        onStatusUpdate={onStatusUpdate}
        isUpdating={updatingStatus === 'confirming'}
      />
      
      <CancelModal
        isOpen={!!cancellingId}
        reason={cancellationReason}
        onReasonChange={onReasonChange}
        onConfirm={() => onConfirmCancel(cancellingId)}
        onClose={onCloseCancel}
        isUpdating={updatingStatus === 'cancelling'}
      />
    </>
  );
});

BookingModals.displayName = 'BookingModals';
export default BookingModals;
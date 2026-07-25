import React, { memo } from 'react';
import { 
  Eye, Image, Calendar, Home, User, Mail, Phone, 
  MessageCircle, Send, Filter,
  IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';
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

const generateBookingMessage = (booking) => {
  const servicesList = booking.serviceItemIds?.map(service => 
    `• ${service.name} - ${service.numberOfPersons || 1} person(s) - ₹${(service.price * (service.numberOfPersons || 1)).toLocaleString()}`
  ).join('\n');
  
  const totalAmount = booking.totalAmount?.toLocaleString();
  const date = new Date(booking.serviceDate).toLocaleDateString();
  const slotDisplay = typeof booking.preferredSlot === 'object' 
    ? (booking.preferredSlot.fullSlot || `${booking.preferredSlot.startTime} - ${booking.preferredSlot.endTime}`)
    : booking.preferredSlot;
  
  return `
Booking Details - ${booking.fullName}

━━━━━━━━━━━━━━━━━━━━
📅 Date: ${date}
⏰ Time: ${slotDisplay}
🏠 Service Type: ${booking.homeService ? 'Home Service 🏠' : 'Studio Service 💅'}
📊 Status: ${booking.status.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━

Services Booked:
${servicesList}

━━━━━━━━━━━━━━━━━━━━
💰 Total Amount: ₹${totalAmount}
━━━━━━━━━━━━━━━━━━━━

Thank you for choosing us! ✨
  `;
};

const handleWhatsApp = (booking) => {
  const message = generateBookingMessage(booking);
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = booking.phoneNumber;
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
  toast.success("Opening WhatsApp...", {
    duration: 3000,
    style: { borderRadius: "12px" },
  });
};

const handleSMS = (booking) => {
  const message = generateBookingMessage(booking);
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = booking.phoneNumber;
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const smsUrl = `sms:${cleanPhone}?body=${encodedMessage}`;
  window.open(smsUrl, '_blank');
  toast.success("Opening Messages...", {
    duration: 3000,
    style: { borderRadius: "12px" },
  });
};

const BookingCard = memo(({ booking, onViewDetails, onStatusUpdate, onCancel, updatingStatus }) => {
  const getSlotDisplay = () => {
    if (typeof booking.preferredSlot === 'object') {
      return booking.preferredSlot.fullSlot || `${booking.preferredSlot.startTime} - ${booking.preferredSlot.endTime}`;
    }
    return booking.preferredSlot;
  };
  
  return (
    <div className="bg-white shadow-md border-gray-200 hover:shadow-lg transition-shadow border rounded-2xl">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400" />
              <h4 className="font-semibold text-gray-900">{booking.fullName}</h4>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3 h-3" />
              <span className="text-xs">{booking.emailId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Phone className="w-3 h-3" />
              <span className="text-xs">{booking.phoneNumber}</span>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>
      
      <div className="p-4 max-h-64 overflow-y-auto">
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date(booking.serviceDate).toLocaleDateString()}</span>
          <span className="text-gray-400">•</span>
          <span>{getSlotDisplay()}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-cyan-600">₹{booking.totalAmount?.toLocaleString()}</span>
          </div>
          {booking.homeService && (
            <span className="text-xs bg-cyan-100 text-cyan-600 px-2 py-1 rounded-full flex items-center gap-1">
              <Home className="w-3 h-3" />
              Home Service
            </span>
          )}
        </div>
        
        {booking.serviceItemIds?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Services:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {booking.serviceItemIds.map((service, idx) => (
                <div key={idx} className="flex items-center gap-3 border border-dashed border-green-400 rounded-lg p-2 m-2">
                  {service.serviceImage ? (
                    <img 
                      src={service.serviceImage} 
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">₹{service.price} × {service.numberOfPersons || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => handleWhatsApp(booking)}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSMS(booking)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 border-dashed"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          
          {booking.status === 'pending' && (
            <button
              onClick={() => onStatusUpdate(booking.booking_id, 'confirmed')}
              disabled={updatingStatus}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              Confirm
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              onClick={() => onStatusUpdate(booking.booking_id, 'completed')}
              disabled={updatingStatus}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Complete
            </button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <button
              onClick={() => onCancel(booking.booking_id)}
              disabled={updatingStatus}
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const BookingTable = memo(({ bookings, onViewDetails, onStatusUpdate, onCancel, updatingStatus }) => {
  const getSlotDisplay = (slot) => {
    if (typeof slot === 'object') {
      return slot.fullSlot || `${slot.startTime} - ${slot.endTime}`;
    }
    return slot;
  };
  
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bookings.map((booking) => (
            <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{booking.fullName}</div>
                <div className="text-sm text-gray-500">{booking.emailId}</div>
                <div className="text-xs text-gray-400">{booking.phoneNumber}</div>
                {booking.homeService && (
                  <span className="text-xs text-cyan-600 inline-flex items-center gap-1 mt-1">
                    <Home className="w-3 h-3" />
                    Home Service
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {new Date(booking.serviceDate).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">{getSlotDisplay(booking.preferredSlot)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-semibold text-cyan-600">
                  ₹{booking.totalAmount?.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewDetails(booking)}
                    className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onStatusUpdate(booking.booking_id, 'confirmed')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs disabled:opacity-50 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => onCancel(booking.booking_id)}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => onStatusUpdate(booking.booking_id, 'completed')}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xs disabled:opacity-50 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => onCancel(booking.booking_id)}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const BookingList = memo(({ 
  bookings, 
  viewMode, 
  updatingStatus, 
  onViewDetails, 
  onStatusUpdate, 
  onCancel 
}) => {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-400 mb-4">
          <Filter className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }
  
  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {bookings.map(booking => (
          <BookingCard
            key={booking.booking_id}
            booking={booking}
            onViewDetails={onViewDetails}
            onStatusUpdate={onStatusUpdate}
            onCancel={onCancel}
            updatingStatus={updatingStatus}
          />
        ))}
      </div>
    );
  }
  
  return (
    <BookingTable
      bookings={bookings}
      onViewDetails={onViewDetails}
      onStatusUpdate={onStatusUpdate}
      onCancel={onCancel}
      updatingStatus={updatingStatus}
    />
  );
});

BookingList.displayName = 'BookingList';
export default BookingList;
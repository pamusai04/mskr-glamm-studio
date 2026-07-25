import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShoppingCart, Tag, Sparkles, Gift } from 'lucide-react';
import { selectCartWithCalculations, selectCartSummary } from '../../../redux/slices/cartSlice';


const OrderSummary = () => {
  const navigate = useNavigate();
  const cart = useSelector(selectCartWithCalculations);
  const { subtotal, totalDiscount, total, totalServices } = useSelector(selectCartSummary);
  const handleViewCart = () => navigate('/cart');
  
  const savingsMessage = totalDiscount > 0 ? `You saved ₹${totalDiscount.toLocaleString('en-IN')}` : null;
 
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 sticky top-24">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
      
      <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4 max-h-60 overflow-y-auto overscroll-contain scroll-smooth pr-1">
        {cart.map((item) => (
          <div key={item._id} className="flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-linear-to-r from-[#E6F0FA] to-[#F0F6FD] border border-[#B8D1E8] hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0">
              <img 
                src={item.service_id?.serviceImage || item.serviceImage} 
                alt={item.service_id?.name || item.name}
                className="w-full h-full object-cover rounded-md sm:rounded-lg"
                onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Service'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.service_id?.name || item.name}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Persons : {item.numberOfPersons}</p>
                
              
              <div className="flex items-center justify-between mt-1">
                
                <p className="text-[#336699] font-semibold text-xs sm:text-sm">
                  ₹{item.service_id?.price} × {item.numberOfPersons} = ₹
                  {(item.numberOfPersons * item.service_id?.price).toLocaleString('en-IN')}
                </p>
                
                {item.discount > 0 && (
                  <span className="text-[9px] sm:text-xs text-green-600 bg-green-50 px-1 sm:px-1.5 py-0.5 rounded">
                    -₹{item.discount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {cart.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <p className="text-gray-500 text-xs sm:text-sm">No items in cart</p>
          </div>
        )}
      </div>
      
      <div className="space-y-1.5 sm:space-y-2 pt-2 sm:pt-3 border-t border-gray-200">
        <div className="flex justify-between text-xs sm:text-sm">
          <span className="text-gray-600">Subtotal ({totalServices} {totalServices === 1 ? 'Service' : 'Services'})</span>
          <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        {totalDiscount > 0 && (
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Tag size={10} className="sm:w-3 sm:h-3" />
              Discount
            </span>
            <span className="text-green-600 font-medium">- ₹{totalDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-1 sm:mt-2">
          <div className="flex justify-between font-bold text-sm sm:text-base">
            <span className="text-gray-900">Total Amount</span>
            <span className="text-[#336699]">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      
      {savingsMessage && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 bg-green-50 rounded-lg border border-green-100">
          <p className="text-[10px] sm:text-xs text-green-700 flex items-center justify-center gap-1">
            <Gift size={10} className="sm:w-3 sm:h-3" />
            {savingsMessage}
          </p>
        </div>
      )}
      
      <button
        onClick={handleViewCart}
        className="mt-4 sm:mt-6 w-full flex items-center justify-center gap-2 bg-linear-to-r from-[#336699] to-[#2A5480] hover:from-[#2A5480] hover:to-[#1F3F60] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all text-xs sm:text-sm font-medium shadow-md hover:shadow-lg active:scale-95"
      >
        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>View Cart</span>
      </button>
      
      <button
        onClick={() => navigate('/services')}
        className="mt-2 sm:mt-3 w-full flex items-center justify-center gap-2 border border-[#336699] text-[#336699] hover:bg-[#E6F0FA] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-medium"
      >
        <Sparkles size={12} className="sm:w-3.5 sm:h-3.5" />
        <span>Add More Services</span>
      </button>
    </div>
  );
};

export default OrderSummary;
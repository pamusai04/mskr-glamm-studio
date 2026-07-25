import React, { memo } from 'react';
import { Tag, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useCart } from './useCart';

const OrderSummary = memo(() => {
  const navigate = useNavigate();
  
  const { 
    subtotal, 
    totalDiscount, 
    total, 
    totalServices,
    savingsMessage,
    handleProceedToCheckout
  } = useCart();

  const handleCheckout = () => {
    handleProceedToCheckout();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 sticky top-24 mb-8">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          Order Summary
        </h2>
        <div className="w-8 sm:w-10 h-0.5 bg-blue-500 rounded-full mt-1.5"></div>
      </div>
      
      <div className="space-y-2 sm:space-y-2.5">
        <div className="flex justify-between text-gray-600 text-xs sm:text-sm">
          <span>Subtotal ({totalServices} {totalServices === 1 ? 'service' : 'services'})</span>
          <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        {totalDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm">
            <span className="flex items-center gap-1">
              <Tag size={14} />
              Discount
            </span>
            <span className="font-semibold">- ₹{totalDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-2 sm:pt-3 mt-2 sm:mt-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium text-sm sm:text-base">Total Amount</span>
            <span className="text-lg sm:text-xl font-bold text-blue-600">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
      
      {savingsMessage && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-[10px] sm:text-xs text-emerald-700 flex items-center justify-center gap-1 sm:gap-1.5">
            <Tag size={12} />
            {savingsMessage}
          </p>
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        className="group w-full mt-4 sm:mt-5 px-4 sm:px-6 py-2 sm:py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <Calendar size={16} />
        Book Appointment
        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
      </button>
      
      <button
        onClick={() => navigate('/services')}
        className="w-full mt-2 sm:mt-2.5 px-4 sm:px-6 py-1.5 sm:py-2 bg-white border border-blue-300 text-blue-600 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 hover:bg-blue-50 hover:border-blue-400 flex items-center justify-center gap-2"
      >
        <Sparkles size={14} />
        Explore More Services
      </button>
    </div>
  );
});

OrderSummary.displayName = 'OrderSummary';

export default OrderSummary;
import React, { memo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, Tag, Loader2 , Clock} from 'lucide-react';
import { removeFromCart, incrementCart, decrementCart } from '../../../redux/slices/cartSlice';
import toast from 'react-hot-toast';

const CartItem = memo(({ item }) => {
  
  const dispatch = useDispatch();
  const { service_id, numberOfPersons, _id, itemTotal, finalPrice, discount, appliedOffer,duration } = item;
  const [isUpdating, setIsUpdating] = useState(false);
  const handleIncrement = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const result = await dispatch(incrementCart(_id)).unwrap();
      toast.success(result.message);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to update quantity';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return 'Not specified';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min${mins !== 1 ? 's' : ''}`;
    if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
  };
  const durationText = formatDuration(service_id?.duration);
  
  const handleDecrement = async () => {
    if (isUpdating || numberOfPersons <= 1) return;
    setIsUpdating(true);
    try {
      const result = await dispatch(decrementCart(_id)).unwrap();
      toast.success(result.message);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to update quantity';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const result = await dispatch(removeFromCart(_id)).unwrap();
      toast.success(result.message);
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to remove item';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`group flex flex-col p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 ${isUpdating ? 'opacity-60' : ''}`} style={{ borderLeft: '4px solid #3B82F6' }}>
      <div className="flex items-start space-x-3 sm:space-x-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-linear-to-br from-blue-50 to-gray-50 shrink-0 shadow-sm">
          {service_id?.serviceImage ? (
            <img 
              src={service_id.serviceImage} 
              alt={service_id.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 text-sm sm:text-base">
                {service_id?.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5">{service_id?.desc}</p>
            </div>
            
            <button
              onClick={handleRemove}
              disabled={isUpdating}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40 transition-all duration-200 shrink-0 ml-2"
              aria-label="Remove item"
            >
              <Trash2 size={16} className="sm:w-18px sm:h-18px" />
            </button>
          </div>
          
          <div className="mt-2 flex justify-between">
            <div>
              {service_id?.originalPrice && Number(service_id.originalPrice) > Number(service_id.price) ? (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm text-gray-400 line-through">
                    ₹{Number(service_id.originalPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-base sm:text-xl font-bold text-blue-600">
                    ₹{Number(service_id.price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                    {Math.round(((Number(service_id.originalPrice) - Number(service_id.price)) / Number(service_id.originalPrice)) * 100)}% OFF
                  </span>
                </div>
              ) : (
                <span className="text-base sm:text-xl font-bold text-blue-600">
                  ₹{Number(service_id?.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div>
              <p className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                  <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                  {durationText}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {appliedOffer && appliedOffer.title && (
        <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-50 border border-blue-200 rounded-full w-fit">
          <Tag size={10} className="sm:w-3 sm:h-3 text-blue-600" />
          <span className="text-[10px] sm:text-xs text-blue-700 font-medium">
            {appliedOffer.title} APPLICABLE
          </span>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium">PERSONS</span>
          <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={handleDecrement}
              disabled={numberOfPersons <= 1 || isUpdating}
              className="p-1 sm:p-1.5 rounded-md bg-white hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              aria-label="Decrease quantity"
            >
              {isUpdating ? <Loader2 size={10} className="sm:w-3 sm:h-3 animate-spin" /> : <Minus size={10} className="sm:w-3 sm:h-3" />}
            </button>
            <span className="font-semibold text-gray-900 min-w-6 sm:min-w-8 text-center text-xs sm:text-sm">
              {numberOfPersons}
            </span>
            <button
              onClick={handleIncrement}
              disabled={numberOfPersons >= 10 || isUpdating}
              className="p-1 sm:p-1.5 rounded-md bg-white hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              aria-label="Increase quantity"
            >
              {isUpdating ? <Loader2 size={10} className="sm:w-3 sm:h-3 animate-spin" /> : <Plus size={10} className="sm:w-3 sm:h-3" />}
            </button>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-base sm:text-lg font-bold text-gray-900">₹{(finalPrice || itemTotal).toLocaleString('en-IN')}</div>
          {discount > 0 && (
            <div className="text-[10px] sm:text-xs text-emerald-600 font-medium">Saved ₹{discount.toLocaleString('en-IN')}</div>
          )}
        </div>
      </div>
    </div>
  );
});

CartItem.displayName = 'CartItem';

export default CartItem;
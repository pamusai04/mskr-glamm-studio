
import { ShoppingCart, Loader2, Clock, TrendingDown, ImageOff } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../redux/slices/cartSlice';
import { 
  formatDuration, 
  calculateDiscountPercentage, 
  hasDiscount,
  formatPrice 
} from '../../../utils/serviceUtils';

const ServiceCard = memo(({ service }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { cart } = useSelector((state) => state.cart);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    
    const existingItem = cart.find(cartItem => 
      cartItem.service_id?._id === service._id || cartItem.service_id === service._id
    );
    
    if (existingItem) {
      toast.error(`${service.name} is already in your cart!`);
      return;
    }
    
    setIsAdding(true);
    try {
      const result = await dispatch(addToCart(service._id)).unwrap();
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(error || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  }, [service, dispatch, cart]);

  const formattedPrice = formatPrice(service?.price);
  const formattedOriginalPrice = formatPrice(service?.originalPrice);
  const discount = hasDiscount(service.originalPrice, service.price);
  const discountPercentage = calculateDiscountPercentage(service.originalPrice, service.price);
  const durationText = formatDuration(service.duration);
  
  const cardClassName = "card bg-white border border-gray-200 rounded-xl sm:rounded-2xl hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group overflow-hidden";
  const addButtonClassName = "absolute left-1/2 -bottom-4 -translate-x-1/2 btn border-0 btn-sm flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[70px] sm:min-w-[80px]";

  return (
    <div className={cardClassName}>
      <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4">
        <div className="flex justify-between items-start gap-6 sm:gap-8 md:gap-10">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base md:text-lg transition-colors text-gray-900 line-clamp-2">
              {service.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-1.5">
              {service.desc}
            </p>
            
            <div className="flex flex-row justify-between items-center">
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                  <p className="text-base sm:text-lg md:text-xl font-semibold text-pink-600">
                    ₹{formattedPrice}
                  </p>
                  {discount && (
                    <>
                      <p className="text-xs sm:text-sm text-gray-400 line-through">
                        ₹{formattedOriginalPrice}
                      </p>
                      <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        <TrendingDown size={10} className="sm:w-3 sm:h-3" />
                        <span className="text-[9px] sm:text-xs font-semibold">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className='flex gap-4 sm:gap-7 items-center'>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    {service.bookCount || 0} bookings
                  </p>
                  <p className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                    {durationText}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
              <figure className="w-full h-full overflow-hidden rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100">
                {!imageError ? (
                  <img
                    src={service.serviceImage}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full text-center flex flex-col items-center justify-center bg-gray-50">
                    <ImageOff className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" strokeWidth={1.5} />
                    <span className="text-[8px] sm:text-[10px] text-gray-400 mt-1">{service.name}</span>
                  </div>
                )}
              </figure>

              <button 
                onClick={handleAddToCart} 
                disabled={isAdding}
                className={addButtonClassName}
              >
                {isAdding ? (
                  <>
                    <Loader2 size={12} className="sm:w-3.5 sm:h-3.5 animate-spin" />
                    <span className="text-[10px] sm:text-xs">Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" />
                    <span className="text-[10px] sm:text-xs">Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.service._id === nextProps.service._id && 
         prevProps.service.bookCount === nextProps.service.bookCount &&
         prevProps.service.price === nextProps.service.price &&
         prevProps.service.originalPrice === nextProps.service.originalPrice &&
         prevProps.service.duration === nextProps.service.duration;
});

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;
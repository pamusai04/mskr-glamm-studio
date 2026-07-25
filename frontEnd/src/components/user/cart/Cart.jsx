import React, { memo, useMemo, useEffect, useRef } from 'react';
import { Tag } from 'lucide-react';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import CartSkeleton  from '../../../common/CartSkeleton';
import { useCart } from './useCart';
import CartItem from './CartItem';
import OfferCard from './OfferCard';
import OrderSummary from './OrderSummary';
import { useNavigate } from 'react-router';

const Cart = () => {
  const navigate = useNavigate();
  const cartContainerRef = useRef(null);
  const hasScrolled = useRef(false);
  
  const {
    cart,
    applicableOffers,
    isCartEmpty,
    loading,
    error,
    applyingOfferId,
    handleApplyOffer,
    handleProceedToCheckout,
    handleRetry
  } = useCart();

  
  useEffect(() => {
    if (!hasScrolled.current && cartContainerRef.current && !loading && cart.length > 0) {
      hasScrolled.current = true;
      setTimeout(() => {
        const navbarHeight = 80;
        const elementPosition = cartContainerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
      }, 150);
    }
  }, [loading, cart.length]);
  
  const cartWithOffers = useMemo(() => {
    if (!cart.length) return cart;
    
    return cart.map(item => {
      const serviceId = item.service_id?._id || item.service_id;
      const matchedOffer = applicableOffers?.find(offer => offer.serviceId === serviceId);
      
      return {
        ...item,
        appliedOffer: matchedOffer?.offer || null,
        discount: matchedOffer?.offer?.totalDiscount || item.discount || 0,
        finalPrice: matchedOffer?.offer?.finalTotal || item.finalPrice || item.itemTotal
      };
    });
  }, [cart, applicableOffers]);

  if (loading) {
    return <CartSkeleton  count={3} />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={handleRetry}
        title="Failed to Load Cart"
      />
    );
  }

  if (isCartEmpty || cart.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <EmptyState 
            title="Your Cart is Empty"
            message="Looks like you haven't added any beauty services to your cart yet. Browse our services and pamper yourself!"
            icon="ShoppingCart"
            showAction={true}
            actionText="Browse Services"
            onAction={() => navigate('/services')}
          />
        </div>
      </div>
    );
  }

  const uniqueServicesCount = cartWithOffers.length;
  const totalPersonsCount = cartWithOffers.reduce((sum, item) => sum + item.numberOfPersons, 0);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div ref={cartContainerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-11">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 md:mt-2">
            {uniqueServicesCount} {uniqueServicesCount === 1 ? 'service' : 'services'} • {totalPersonsCount} {totalPersonsCount === 1 ? 'person' : 'persons'}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="flex-1">
            <div className="space-y-4">
              {cartWithOffers.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                />
              ))}
            </div>
            
            {applicableOffers && applicableOffers.length > 0 && (
              <div className="mt-8 bg-white rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={18} className="text-blue-600 shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-base md:text-lg">Special Offers for You</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shrink-0">
                    {applicableOffers.length} {applicableOffers.length === 1 ? 'Offer' : 'Offers'}
                  </span>
                </div>
                
                
                <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                  <div className="flex gap-3 sm:gap-4">
                    {applicableOffers.map((offer, index) => (
                      <div key={offer.offer?.offerId } className="min-w-sm">
                        <OfferCard
                          offer={offer}
                          onApply={handleApplyOffer}
                          isApplying={applyingOfferId === (offer.offer?.offerId || offer.offerId)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:w-96">
            <OrderSummary/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Cart);
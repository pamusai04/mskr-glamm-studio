import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import {
  removeFromCart,
  incrementCart,
  decrementCart,
  applyOfferToCart,
  selectCartWithCalculations,
  selectCartSummary,
  selectApplicableOffers,
  selectAppliedOffer,
  selectIsCartEmpty,
  selectCartLoading,
  selectCartError,
  selectOfferApplying
} from '../../../redux/slices/cartSlice';
import { useState } from 'react';

export const useCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const cart = useSelector(selectCartWithCalculations);
  const { subtotal, totalDiscount, total, totalServices } = useSelector(selectCartSummary);
  const applicableOffers = useSelector(selectApplicableOffers);
  const appliedOffer = useSelector(selectAppliedOffer);
  const isCartEmpty = useSelector(selectIsCartEmpty);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const offerApplying = useSelector(selectOfferApplying);
  
  const [applyingOfferId, setApplyingOfferId] = useState(null);


  const handleApplyOffer = useCallback(async (offerId) => {
    setApplyingOfferId(offerId);
    try {
      const result = await dispatch(applyOfferToCart(offerId)).unwrap();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Failed to apply offer');
      }
      
    } catch (error) {
      const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to apply offer';
      toast.error(errorMessage);
    } finally {
      setApplyingOfferId(null);
    }
  }, [dispatch]);


  const handleProceedToCheckout = useCallback(() => {
    navigate('/booking', {
      state: {
        appliedOfferId: appliedOffer?.offerId || null
      }
    });
  }, [navigate, appliedOffer]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const savingsMessage = totalDiscount > 0 ? `You saved ₹${totalDiscount.toLocaleString('en-IN')} on this order!` : null;

  return {
    cart,
    subtotal,
    totalDiscount,
    total,
    totalServices,
    applicableOffers,
    appliedOffer,
    isCartEmpty,
    loading,
    error,
    offerApplying,
    applyingOfferId,
    savingsMessage,
    handleApplyOffer,
    handleProceedToCheckout,
    handleRetry
  };
};
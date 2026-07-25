
import React, { memo, useCallback } from 'react';

const OfferCard = memo(({ offer, onApply, isApplying }) => {
  const handleApply = useCallback(() => {
    onApply(offer.offer?.offerId || offer.offerId);
  }, [onApply, offer]);
  
  const offerData = offer.offer;
  const serviceName = offer.serviceName;
  const discountValue = offerData.discountValue;
  const discountType = offerData.offerType;
  const savedAmount = offerData.totalDiscount;

  const getDiscountDisplay = () => {
    if (discountType === 'percentage') {
      return `${discountValue}%`;
    }
    return `₹${discountValue}`;
  };

  return (
    <div className="flex items-center justify-between w-full h-full max-w-md min-h-25 rounded-xl px-4 py-3 border border-dashed transition-all duration-300 bg-linear-to-br from-blue-50 to-white border-blue-100 hover:border-blue-200 hover:shadow-md ">
      <div className="flex flex-col justify-between flex-1 pr-3">
        <div>
          <span className="inline-block text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full mb-2">
            {serviceName}
          </span>
          <h4 className="font-bold text-sm line-clamp-2 mb-1 text-gray-800">
            {offerData.title}
          </h4>
          <p className="text-[10px] sm:text-xs text-blue-600 mt-2 font-medium">
            You save ₹{savedAmount} on this service
          </p>
        </div>
      </div>

      <div className="h-full w-px bg-linear-to-b from-transparent via-blue-200 to-transparent mx-2"></div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-md bg-linear-to-br from-blue-600 to-blue-800">
          <span className="text-lg font-bold text-white">
            {getDiscountDisplay()}
          </span>
          <span className="text-[10px] text-blue-100 font-medium">OFF</span>
        </div>
        
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="px-4 py-1.5 bg-linear-to-r from-blue-500 to-blue-600 text-white text-xs rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap shadow-sm hover:shadow-md w-full"
        >
          {isApplying ? 'Applying...' : 'Apply Offer'}
        </button>
      </div>
    </div>
  );
});

OfferCard.displayName = 'OfferCard';

export default OfferCard;
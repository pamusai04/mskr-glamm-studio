import React, { memo } from 'react';
import { CalendarDays } from 'lucide-react';
const OfferCard = memo(({ offer }) => {
  const offerData = offer ;
  const serviceName = offerData?.serviceName;
  const discountValue = offerData.discountValue;
  const discountType = offerData.offerType;
  const validUntil = new Date(offerData.validUntil);
  validUntil.setHours(23, 59, 59, 999);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const isExpired = validUntil < today;
  const daysRemaining = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));

  const getDiscountDisplay = () => {
    if (discountType?.toUpperCase() === "PERCENTAGE") {
      return `${discountValue}%`;
    }
    return `₹${discountValue}`;
  };

  const getValidityStatus = () => {
    if (isExpired) {
      return {
        text: 'Expired',
        bgClass: 'bg-red-100 text-red-700',
        dotColor: 'bg-red-500',
        pingColor: 'bg-red-400'
      };
    }
    if (daysRemaining <= 3) {
      return {
        text: `Ends in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`,
        bgClass: 'bg-orange-100 text-orange-700',
        dotColor: 'bg-orange-500',
        pingColor: 'bg-orange-400'
      };
    }
    return {
      text: `${daysRemaining} days left`,
      bgClass: 'bg-green-100 text-green-700',
      dotColor: 'bg-green-500',
      pingColor: 'bg-green-400'
    };
  };

  const validity = getValidityStatus();

  return (
    <div className={`flex items-center justify-between w-full h-full max-w-md min-h-25 rounded-xl px-4 py-3 border border-dashed transition-all duration-300 cursor-pointer ${
      isExpired 
        ? 'bg-gray-50 border-gray-200 opacity-75' 
        : 'bg-linear-to-br from-blue-50 to-white border-blue-100 hover:border-blue-200'
    }`}>
      <div className="flex flex-col justify-between flex-1 pr-3">
        <div>
          <span className="inline-block text-xs text-blue-600 font-semibold bg-blue-100 px-2 py-0.5 rounded-full mb-2">
            {serviceName}
          </span>
          <h4 className={`font-bold text-sm line-clamp-2 mb-1 ${isExpired ? 'text-gray-500' : 'text-gray-800'}`}>
            {offerData?.title}
          </h4>
          <p className={`text-xs line-clamp-2 ${isExpired ? 'text-gray-400' : 'text-gray-500'}`}>
            {offerData?.description}
          </p>
        </div>
        
        <div className="text-[11px] mt-2 flex items-center gap-2">
          <CalendarDays className="text-gray-500" size={18}/>
          <span className={isExpired ? 'text-gray-400 line-through' : 'text-gray-500'}>
            {validUntil.toLocaleDateString()}
          </span>
          
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="inline-grid *:[grid-area:1/1]">
              <div className={`w-2 h-2 rounded-full ${validity.pingColor} animate-ping`}></div>
              <div className={`w-2 h-2 rounded-full ${validity.dotColor}`}></div>
            </div>
            <span className="text-[10px] font-medium text-gray-600">
              {validity.text}
            </span>
          </div>
        </div>
      </div>

      <div className="h-14 w-px bg-linear-to-b from-transparent via-blue-200 to-transparent mx-2"></div>

      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full shadow-md ${
        isExpired 
          ? 'bg-linear-to-br from-gray-500 to-gray-700' 
          : 'bg-linear-to-br from-blue-600 to-blue-800'
      }`}>
        <span className="text-lg font-bold text-white">
          {getDiscountDisplay()}
        </span>
        <span className="text-[10px] text-blue-100 font-medium">OFF</span>
      </div>
    </div>
  );
});

OfferCard.displayName = 'OfferCard';

export default OfferCard;

import React, { memo, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import StarRating from './StarRating';

const ReviewCard = memo(({ review }) => {
  const formattedDate = useMemo(() => {
    return new Date(review.createdAt || review.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, [review.createdAt, review.date]);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-purple-100">
      {review.serviceImage && (
        <div className="relative w-full h-40 sm:h-44 md:h-48 bg-linear-to-br from-purple-50 to-blue-50 overflow-hidden">
          <img
            src={review.serviceImage}
            alt={review.serviceName}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/fallback-image.jpg';
            }}
          />
        </div>
      )}
      
      <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
        <div className="mb-2 sm:mb-3">
          <StarRating rating={review.rating} size={14} />
        </div>
        
        <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed text-xs sm:text-sm flex-grow">
          {review.reviewMessage || review.reviewText}
        </p>
        
        <div className="pt-2 sm:pt-3 border-t border-purple-100 mt-auto">
          <div>
            <p className="font-semibold text-[#663399] text-xs sm:text-sm truncate" title={review.serviceName}>
              {review.serviceName}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500 mt-1">
              <Calendar size={10} className="sm:w-3 sm:h-3 text-[#336699]" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';

export default ReviewCard;

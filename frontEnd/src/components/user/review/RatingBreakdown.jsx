import React, { memo, useMemo } from "react";
import StarRating from "./StarRating";

const RatingBreakdown = memo(({ reviews, averageRating }) => {
  const ratingStats = useMemo(() => {
    const stats = {};
    [5, 4, 3, 2, 1].forEach((rating) => {
      const count = reviews.filter((r) => r.rating === rating).length;
      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
      stats[rating] = { count, percentage };
    });
    return stats;
  }, [reviews]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 border border-[#663399]/20">
      <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        
        <div className="flex md:w-1/3 flex-col items-center justify-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#e9d4f5"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                stroke="#663399"
                strokeWidth="8"
                fill="none"
                strokeDasharray={283}
                strokeDashoffset={
                  283 - (parseFloat(averageRating) / 5) * 283
                }
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl sm:text-3xl md:text-3xl font-bold text-[#663399]">
                {averageRating}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {reviews.length} reviews
              </span>
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <StarRating rating={parseFloat(averageRating)} size={16} />
          </div>

          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Based on {reviews.length} reviews
          </div>
        </div>

        <div className="flex-1 w-full md:w-2/3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-2 sm:mb-3 group cursor-pointer">
              <span className="text-xs sm:text-sm text-gray-600 font-medium w-7 sm:w-8 group-hover:text-[#663399] transition-colors">
                {rating}★
              </span>
              <div className="flex-1 h-1.5 sm:h-2 bg-[#663399]/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#663399] rounded-full transition-all duration-500 ease-out group-hover:scale-x-105"
                  style={{
                    width: `${ratingStats[rating]?.percentage || 0}%`,
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-500 w-10 sm:w-12 group-hover:text-[#663399] transition-colors">
                {ratingStats[rating]?.count || 0}
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
});

RatingBreakdown.displayName = "RatingBreakdown";

export default RatingBreakdown;
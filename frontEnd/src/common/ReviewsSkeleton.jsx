import React, { memo } from 'react';

const ReviewsSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-15 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col text-center sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <div className="h-7 sm:h-9 md:h-11 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto sm:mx-0"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse mx-auto sm:mx-0"></div>
          </div>
          <div className="h-9 sm:h-10 md:h-11 w-32 bg-gray-200 rounded-lg animate-pulse mx-auto sm:mx-0"></div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 border border-[#663399]/20 animate-pulse">
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="flex md:w-1/3 flex-col items-center justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-200 rounded-full"></div>
              <div className="mt-2 sm:mt-3 h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-3 w-20 bg-gray-200 rounded mt-1"></div>
            </div>
            <div className="flex-1 w-full md:w-2/3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                  <div className="h-4 w-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <div className="h-10 sm:h-11 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100 animate-pulse">
              <div className="relative w-full h-40 sm:h-44 md:h-48 bg-linear-to-br from-purple-50 to-blue-50">
                <div className="w-full h-full bg-gray-200"></div>
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <div className="mb-2 sm:mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star} className="w-3 h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3 sm:mb-4"></div>
                <div className="pt-2 sm:pt-3 border-t border-purple-100">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ReviewsSkeleton.displayName = 'ReviewsSkeleton';

export default ReviewsSkeleton;
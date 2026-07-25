import React, { memo } from 'react';

const GallerySkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-white px-3 sm:px-4 lg:px-8 xl:px-24 pb-10 sm:pb-12 md:pb-16 overflow-x-hidden">
      <div className="container mx-auto px-2 sm:px-3 md:px-4 relative z-10">
        <div className="pt-8 sm:pt-10 md:pt-12 lg:pt-16">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-7 sm:h-9 md:h-11 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-5 sm:mt-6 md:mt-8">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="text-center">
                  <div className="h-6 sm:h-7 md:h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10 sticky top-16 sm:top-20 z-20 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl p-2 sm:p-3 shadow-md">
          <div className="w-full overflow-x-auto scrollbar-hide bg-linear-to-r from-pink-100 via-purple-100 to-blue-100 p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl flex gap-1.5 sm:gap-2 justify-start md:justify-center md:flex-wrap md:overflow-visible">
            {[1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className="h-7 sm:h-8 md:h-9 w-16 sm:w-20 md:w-24 bg-gray-200 rounded-full animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 transition-all duration-300 mb-10">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="group relative">
                <div className="relative cursor-pointer overflow-hidden rounded-lg sm:rounded-xl shadow-md bg-white animate-pulse">
                  <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-pink-100 to-purple-100">
                    <div className="w-full h-full bg-gray-200"></div>
                    <div className="absolute top-2 left-2 w-12 h-5 bg-gray-300 rounded-full"></div>
                  </div>

                  <div className="p-1.5 sm:p-2 md:p-2.5 bg-white flex flex-col gap-0.5 sm:gap-1">
                    <div className="h-3 sm:h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-2 sm:h-3 w-48 bg-gray-200 rounded"></div>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-1">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-200 rounded-full"></div>
                      <div className="h-2 w-12 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

GallerySkeleton.displayName = 'GallerySkeleton';

export default GallerySkeleton;
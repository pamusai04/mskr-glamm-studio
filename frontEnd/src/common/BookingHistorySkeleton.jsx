import React, { memo } from 'react';

const BookingHistoryCardSkeleton = memo(() => {
  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-pulse">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
        </div>

        <div className="mb-6">
          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-8 bg-gray-200 rounded"></div>
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-8 bg-gray-200 rounded mt-1 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-4 w-8 bg-gray-200 rounded mt-1 mx-auto"></div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-2">
            <div className="flex justify-between">
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3 flex-wrap">
          <div className="flex-1 h-11 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-11 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 h-11 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
});

BookingHistoryCardSkeleton.displayName = 'BookingHistoryCardSkeleton';

export default BookingHistoryCardSkeleton;
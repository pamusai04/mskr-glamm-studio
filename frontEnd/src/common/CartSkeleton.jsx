import React, { memo } from 'react';

const CartSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-11">
        <div className="mb-6 md:mb-8">
          <div className="h-8 sm:h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-4 sm:h-5 w-64 bg-gray-200 rounded-lg mt-2 animate-pulse"></div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          <div className="flex-1 min-w-0">
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 animate-pulse">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-200 shrink-0"></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="h-5 sm:h-6 w-3/4 sm:w-1/2 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 sm:h-4 w-full sm:w-3/4 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-lg shrink-0"></div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="h-5 sm:h-6 w-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-md"></div>
                        <div className="w-6 h-4 bg-gray-200 rounded"></div>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-md"></div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="h-5 sm:h-6 w-24 bg-gray-200 rounded ml-auto"></div>
                      <div className="h-3 w-20 bg-gray-200 rounded mt-1 ml-auto"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-white rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-12 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              
              <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex gap-3 sm:gap-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="min-w-[280px] sm:min-w-[320px]">
                      <div className="flex items-center justify-between rounded-xl px-3 py-3 bg-gray-100 animate-pulse">
                        <div className="flex-1 pr-2">
                          <div className="w-16 h-4 sm:h-5 bg-gray-200 rounded-full mb-2"></div>
                          <div className="h-4 w-28 sm:w-32 bg-gray-200 rounded mb-1"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded mt-2"></div>
                        </div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-96 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 animate-pulse">
              <div className="mb-4 sm:mb-5">
                <div className="h-6 sm:h-7 w-32 bg-gray-200 rounded"></div>
                <div className="w-8 sm:w-10 h-0.5 bg-gray-200 rounded-full mt-1.5"></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-gray-100 rounded-lg">
                <div className="h-3 w-40 bg-gray-200 rounded mx-auto"></div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="h-9 sm:h-10 w-full bg-gray-200 rounded-lg"></div>
                <div className="h-8 sm:h-9 w-full bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CartSkeleton.displayName = 'CartSkeleton';

export default CartSkeleton;
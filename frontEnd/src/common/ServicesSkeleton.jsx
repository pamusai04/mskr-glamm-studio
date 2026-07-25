import React, { memo } from 'react';

const ServicesSkeleton = memo(() => {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      <div className="fixed top-0 left-0 w-full z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 pt-20 lg:pt-24 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 lg:py-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide p-1">
                  <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="w-24 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="w-20 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                  <div className="w-24 h-9 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 shrink-0">
                <div className="w-80 lg:w-96">
                  <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-20">
        <div className="lg:hidden">
          <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-5 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3 pb-1 sm:mb-4 border-b border-blue-100">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide pb-2">
              <div className="flex gap-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="min-w-xs shrink-0">
                    <div className="w-full h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-8">
            {[1, 2, 3].map((categoryIndex) => (
              <div key={categoryIndex} className="bg-gray-100 rounded-xl shadow-sm overflow-hidden">
                <div className="py-3 sm:py-4 px-4 sm:px-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                      <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
                      <div className="w-12 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </div>

                <div className="p-2 sm:p-4">
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {[1, 2, 3].map((itemIndex) => (
                      <div key={itemIndex} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                          </div>
                          <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex lg:gap-8">
          <div className="flex-1 min-w-0">
            <div className="space-y-4 sm:space-y-8">
              {[1, 2, 3].map((categoryIndex) => (
                <div key={categoryIndex} className="bg-blue-50 rounded-xl shadow-sm overflow-hidden">
                  <div className="py-3 sm:py-4 px-4 sm:px-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-6 w-32 bg-gray-300 rounded animate-pulse"></div>
                        <div className="w-12 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                      </div>
                      <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </div>

                  <div className="p-2 sm:p-4">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      {[1, 2, 3].map((itemIndex) => (
                        <div key={itemIndex} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                            <div className="flex-1">
                              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
                              <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                            </div>
                            <div className="w-24 h-10 bg-gray-200 rounded-lg"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-96 shrink-0">
            <div className="sticky top-39">
              <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="p-5 pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                <div className="p-5 pt-3">
                  <div className="space-y-4">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="w-full h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ServicesSkeleton.displayName = 'ServicesSkeleton';

export default ServicesSkeleton;
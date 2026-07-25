import React, { memo } from 'react';

const UserProfileSkeleton = memo(() => {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-8 pt-8 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse"></div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mx-auto md:mx-0"></div>
                <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse mx-auto md:mx-0"></div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>

              <div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
                <div className="h-3 w-64 bg-gray-200 rounded mx-auto mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-10">
            <div className="h-5 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

UserProfileSkeleton.displayName = 'UserProfileSkeleton';

export default UserProfileSkeleton;
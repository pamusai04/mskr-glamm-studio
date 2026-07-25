import React from 'react';
const LoadingAnimation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="flex flex-col items-center gap-6 px-8 py-12">
        <div className="w-64 md:w-80 overflow-hidden">
          <div className="h-[2px] relative">
            <div 
              className="absolute inset-0 bg-repeat-x animate-dots-right"
              style={{
                backgroundImage: 'radial-gradient(circle, #ec4899 2px, transparent 2px)',
                backgroundSize: '16px 2px',
              }}
            />
          </div>
        </div>

        <div className="relative flex flex-col items-center">
          <div className="relative w-52 h-52 md:w-60 md:h-60">
            <div className="absolute inset-0 rounded-full border-[6px] border-transparent border-t-pink-500 border-r-pink-400 border-b-pink-300 border-l-pink-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border-[4px] border-transparent border-t-pink-400 border-l-pink-300 border-b-pink-500 border-r-pink-400 animate-spin-slow" />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-full shadow-2xl shadow-pink-200/50">
              <div className="text-center px-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-wider text-pink-600">
                  MSKR
                </h1>
                <h2 className="text-base md:text-lg font-semibold tracking-[0.2em] text-gray-700 mt-1">
                  GLAMM STUDIO
                </h2>
                <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto my-2" />
                <p className="text-[10px] md:text-[11px] font-medium tracking-[0.15em] text-gray-500 uppercase">
                  Makeup & Beauty Studio
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-64 md:w-80 overflow-hidden">
          <div className="h-[2px] relative">
            <div 
              className="absolute inset-0 bg-repeat-x animate-dots-left"
              style={{
                backgroundImage: 'radial-gradient(circle, #ec4899 2px, transparent 2px)',
                backgroundSize: '16px 2px',
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm font-medium text-gray-500 tracking-wider">Loading</span>
          <span className="loading loading-dots loading-xl text-pink-500" />
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
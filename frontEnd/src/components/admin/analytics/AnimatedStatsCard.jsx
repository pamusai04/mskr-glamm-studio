import React, { memo, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const AnimatedStatsCard = memo(({ title, value, subValue, icon: Icon, trend, trendValue, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] group animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`absolute inset-0 bg-linear-to-r from-gray-50 to-white transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2 tracking-tight">{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center transition-all duration-300 ${isHovered ? 'scale-110 rotate-6' : ''}`}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 mt-4 transition-all duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue}
            </span>
            <span className="text-xs text-gray-400 ml-1">vs last period</span>
          </div>
        )}
      </div>
      
      <div className={`absolute bottom-0 left-0 h-1 bg-emerald-600 transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'}`} />
    </div>
  );
});

AnimatedStatsCard.displayName = 'AnimatedStatsCard';
export default AnimatedStatsCard;
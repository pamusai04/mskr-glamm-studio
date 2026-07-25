import React, { memo, useState, useEffect } from 'react';

const SmoothProgressBar = memo(({ label, value, total, color, delay }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  const colorClasses = {
    gray: 'bg-gray-700',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
});

SmoothProgressBar.displayName = 'SmoothProgressBar';
export default SmoothProgressBar;
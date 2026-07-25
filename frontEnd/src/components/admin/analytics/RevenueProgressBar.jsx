

import React, { memo, useState, useEffect } from 'react';

const RevenueProgressBar = memo(({ name, revenue, percentage }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{name}</span>
        <span className="font-bold text-gray-900">₹{revenue.toLocaleString()}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gray-700 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
});

RevenueProgressBar.displayName = 'RevenueProgressBar';
export default RevenueProgressBar;
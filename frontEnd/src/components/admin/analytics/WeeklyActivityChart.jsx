import React, { memo } from 'react';
import { format } from 'date-fns';

const WeeklyActivityChart = memo(({ dailyData }) => {
  const maxCount = Math.max(...dailyData.map(d => d.count), 1);
  
  return (
    <div className="w-full">
      <div className="flex justify-around items-end h-64 gap-1 sm:gap-2">
        {dailyData.map((day, idx) => {
          const height = (day.count / maxCount) * 100;
          return (
            <div key={idx} className="text-center flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-500 mb-2 truncate">{format(day.date, 'EEE')}</div>
              <div className="relative h-40 flex items-end justify-center">
                <div 
                  className="absolute bottom-0 w-full max-w-[40px] sm:max-w-[50px] bg-gradient-to-t from-gray-600 to-gray-700 rounded-t-lg transition-all duration-500 hover:from-gray-700 hover:to-gray-800 cursor-pointer group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-md z-10">
                    {day.count} bookings
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-700 mt-2">₹{day.revenue.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

WeeklyActivityChart.displayName = 'WeeklyActivityChart';
export default WeeklyActivityChart;
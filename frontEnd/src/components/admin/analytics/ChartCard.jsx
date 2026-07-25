import React, { memo, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const ChartCard = memo(({ title, children, delay }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up ${isMaximized ? 'fixed inset-4 z-50 overflow-auto bg-white' : ''}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={() => setIsMaximized(!isMaximized)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMaximized ? <Minimize2 className="w-5 h-5 text-gray-500" /> : <Maximize2 className="w-5 h-5 text-gray-500" />}
        </button>
      </div>
      <div className={isMaximized ? 'max-h-[calc(100vh-120px)] overflow-auto' : ''}>
        {children}
      </div>
    </div>
  );
});

ChartCard.displayName = 'ChartCard';
export default ChartCard;
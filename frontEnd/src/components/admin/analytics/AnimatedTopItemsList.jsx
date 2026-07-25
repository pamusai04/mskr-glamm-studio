import React, { memo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const AnimatedTopItemsList = memo(({ title, items, icon: Icon, delay }) => {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? items : items.slice(0, 5);
  
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-center text-gray-500 py-8">No data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {items.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            {expanded ? 'Show Less' : `View All (${items.length})`}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {displayItems.map((item, idx) => (
          <div 
            key={idx} 
            className="flex items-center justify-between group cursor-pointer transition-all duration-300 hover:translate-x-1"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
              <span className="text-gray-800 font-medium group-hover:text-gray-900 transition-colors">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AnimatedTopItemsList.displayName = 'AnimatedTopItemsList';
export default AnimatedTopItemsList;
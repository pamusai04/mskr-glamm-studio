import React, { memo } from 'react';

const ViewToggle = memo(({ view, setView }) => {
  return (
    <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => setView('monthly')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          view === 'monthly'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => setView('yearly')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          view === 'yearly'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Yearly
      </button>
    </div>
  );
});

ViewToggle.displayName = 'ViewToggle';
export default ViewToggle;
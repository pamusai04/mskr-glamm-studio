import React, { memo, useState, useEffect, useRef } from 'react';
import { CalendarRange, ChevronDown } from 'lucide-react';

const DateRangeDropdown = memo(({ dateRange, setDateRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const options = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
  ];
  
  const selectedLabel = options.find(opt => opt.value === dateRange)?.label || 'Select Range';
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-700 font-medium hover:border-gray-400 transition-all duration-300"
      >
        <CalendarRange className="w-4 h-4" />
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in-up">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setDateRange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ${
                dateRange === option.value
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

DateRangeDropdown.displayName = 'DateRangeDropdown';
export default DateRangeDropdown;
import React, { memo, useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div className="relative flex-1 min-w-[110px] sm:min-w-[130px] md:min-w-[140px]" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-6 sm:pr-8 text-xs sm:text-sm md:text-base text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#663399] focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-[#663399] transition-all duration-200 flex items-center justify-between group"
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown 
          className={`text-gray-400 group-hover:text-[#663399] transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={14}
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#663399]/20 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto scrollbar-hide">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm md:text-base transition-all duration-150 ${
                  value === option.value 
                    ? 'bg-[#663399]/10 text-[#663399] font-medium' 
                    : 'text-gray-600 hover:bg-[#663399]/10 hover:text-[#663399]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewFilters = memo(({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  selectedService,
  onServiceChange,
  serviceNames
}) => {
  const ratingOptions = [
    { value: 'all', label: '⭐ All Ratings' },
    { value: '5', label: '★★★★★ (5 Stars)' },
    { value: '4', label: '★★★★☆ (4 Stars)' },
    { value: '3', label: '★★★☆☆ (3 Stars)' },
    { value: '2', label: '★★☆☆☆ (2 Stars)' },
    { value: '1', label: '★☆☆☆☆ (1 Star)' }
  ];
  
  const serviceOptions = [
    { value: 'all', label: '✨ All Services' },
    ...serviceNames.map(service => ({ value: service, label: service }))
  ];
  
  return (
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="flex-1">
        <div className="relative group">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-[#663399] transition-colors duration-200" 
            size={16} 
          />
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search by service name or review..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-[#663399] hover:border-[#663399] transition-all duration-200 placeholder:text-gray-400"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <CustomSelect
          value={filter}
          onChange={onFilterChange}
          options={ratingOptions}
          placeholder="Select Rating"
        />
        
        <CustomSelect
          value={selectedService}
          onChange={onServiceChange}
          options={serviceOptions}
          placeholder="Select Service"
        />
      </div>
    </div>
  );
});

ReviewFilters.displayName = 'ReviewFilters';

export default ReviewFilters;
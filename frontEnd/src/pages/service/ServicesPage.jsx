import { LayoutList, ChevronDown, Search, SearchX, X, SquarePen, Tag } from 'lucide-react';
import { memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../../components/user/services/useServices';
import ServiceCard from '../../components/user/services/ServiceCard';
import ErrorState from '../../common/ErrorState';
import OfferCard from '../../components/user/services/OfferCard';
import ServicesSkeleton from "../../common/ServicesSkeleton"

const Services = memo(() => {
  const navigate = useNavigate();
  const {
    filteredServices,
    searchQuery,
    activeFilter,
    loading,
    error,
    openCategory,
    showSearchMobile,
    setShowSearchMobile,
    hasResults,
    handleSearchChange,
    handleFilterChange,
    handleReset,
    handleRetry,
    handleToggleCategory,
    offers,
    offersLoading
  } = useServices();
  const filterButtons = useMemo(() => ['all', 'beauty', 'makeup'], []);
  
  const handleWriteReview = useCallback(() => {
    navigate('/write-review');
  }, [navigate]);

  if (loading && filteredServices.length === 0) {
    return <ServicesSkeleton/>;
  }

  if (error && filteredServices.length === 0) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRetry}
        title="Failed to Load Services"
        icon="network"
      />
    );
  }
  
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white text-gray-900">
      <div className="fixed top-0 left-0 w-full z-20 bg-white/95 backdrop-blur-md border-b border-gray-200 pt-20 lg:pt-24 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2 lg:py-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide p-1">
                  <button
                    className="btn btn-circle md:hidden text-white bg-black hover:bg-gray-800 border-0 shrink-0 w-9 h-9 min-h-0"
                    onClick={() => setShowSearchMobile(!showSearchMobile)}
                  >
                    {showSearchMobile ? <X size={18} /> : <Search size={18} />}
                  </button>
                  
                  {filterButtons.map(filter => (
                    <button
                      key={filter}
                      className={`btn rounded-full px-4 sm:px-5 md:px-6 whitespace-nowrap transition-all duration-200 hover:scale-105 text-xs sm:text-sm md:text-base h-9 sm:h-10 ${
                        activeFilter === filter
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleFilterChange(filter)}
                    >
                      {filter === 'all' ? 'All Services' : filter === 'beauty' ? 'Beauty' : 'Makeup'}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleWriteReview}
                    className="btn btn-primary rounded-full gap-1.5 sm:gap-2 transition-transform duration-300 hover:scale-105 text-xs sm:text-sm md:text-base h-9 sm:h-10 px-4 sm:px-5"
                  >
                    <SquarePen size={16} className="sm:w-4 sm:h-4" />
                    Write Review
                  </button>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 shrink-0">
                <div className="w-80 lg:w-96">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search services..."
                      className="w-full pl-10 pr-4 py-0 h-10 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors text-sm"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {showSearchMobile && (
              <div className="mt-3 md:hidden animate-fadeIn">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors text-base"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-20">
        <div className="lg:hidden">
          {offers && offers.length > 0 && !offersLoading && (
            <div className="mb-6 sm:mb-8 bg-white rounded-xl p-4 sm:p-5 border border-blue-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-1 sm:mb-4 border-b border-blue-100">
                <Tag size={18} className="text-blue-600 shrink-0" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base md:text-lg">
                  Special Offers for You
                </h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shrink-0">
                  {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'}
                </span>
              </div>
              
              <div className="overflow-x-auto scrollbar-hide pb-2">
                <div className="flex gap-4">
                  {offers.map((offer) => (
                    <div key={offer._id} className="min-w-xs shrink-0">
                      <OfferCard offer={offer} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {!hasResults ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center justify-center">
                <SearchX className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">No beauty services found</h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">Try changing filters or clearing search</p>
                <button className="btn btn-dash btn-wide text-sm sm:text-base" onClick={handleReset}>Reset</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-8">
              {filteredServices.map((category, index) => (
                <div 
                  key={category._id} 
                  className="collapse bg-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div 
                    className="collapse-title py-3 sm:py-4 px-4 sm:px-5 cursor-pointer text-gray-900"
                    onClick={() => handleToggleCategory(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <LayoutList className="text-pink-500 shrink-0" size={20} />
                        <span className="text-md md:text-xl font-semibold">{category.title}</span>
                        <span className="badge badge-outline badge-neutral text-xs sm:text-sm">
                          {category.items?.length || 0}
                        </span>
                      </div>
                      <ChevronDown
                        className={`text-pink-500 transition-transform duration-300 shrink-0 ${
                          openCategory === index ? 'rotate-180' : 'rotate-0'
                        }`}
                        size={20}
                      />
                    </div>
                  </div>

                  <div className={`transition-all duration-300 ${openCategory === index ? 'block' : 'hidden'}`}>
                    <div className="p-2 sm:p-4 grid grid-cols-1 gap-3 sm:gap-4">
                      {category.items?.map(service => (
                        <ServiceCard key={service._id} service={service} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex lg:gap-8">
          <div className="flex-1 min-w-0">
            {!hasResults ? (
              <div className="text-center py-20">
                <div className="flex flex-col items-center justify-center">
                  <SearchX className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">No beauty services found</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">Try changing filters or clearing search</p>
                  <button className="btn btn-dash btn-wide text-sm sm:text-base" onClick={handleReset}>Reset</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                {filteredServices.map((category, index) => (
                  <div 
                    key={category._id} 
                    className="collapse bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    <div 
                      className="collapse-title py-3 sm:py-4 px-4 sm:px-5 cursor-pointer text-gray-900"
                      onClick={() => handleToggleCategory(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <LayoutList className="text-pink-500 shrink-0" size={20} />
                          <span className="text-md md:text-xl font-semibold">{category.title}</span>
                          <span className="badge badge-outline badge-neutral text-xs sm:text-sm">
                            {category.items?.length || 0}
                          </span>
                        </div>
                        <ChevronDown
                          className={`text-pink-500 transition-transform duration-300 shrink-0 ${
                            openCategory === index ? 'rotate-180' : 'rotate-0'
                          }`}
                          size={20}
                        />
                      </div>
                    </div>

                    <div className={`transition-all duration-300 ${openCategory === index ? 'block' : 'hidden'}`}>
                      <div className="p-2 sm:p-4 grid grid-cols-1 gap-3 sm:gap-4">
                        {category.items?.map(service => (
                          <ServiceCard key={service._id} service={service} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {offers && offers.length > 0 && !offersLoading && (
            <div className="w-96 shrink-0">
              <div className="sticky top-39">
                <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
                  <div className="p-5 pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-blue-600 shrink-0" />
                      <h3 className="font-semibold text-gray-900 text-base">
                        Special Offers
                      </h3>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full shrink-0">
                        {offers.length} {offers.length === 1 ? 'Offer' : 'Offers'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 pt-3 max-h-100 overflow-y-auto scrollbar-thin">
                    <div className="space-y-4">
                      {offers.map((offer, index) => (
                        <OfferCard key={offer._id || index} offer={offer} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

Services.displayName = 'Services';

export default Services;
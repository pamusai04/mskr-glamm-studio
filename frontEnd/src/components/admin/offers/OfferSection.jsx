import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOffers, deleteOffer } from '../../../redux/slices/offerSlice';
import { fetchAllServices } from '../../../redux/slices/adminServiceSlice';
import { toast } from 'react-hot-toast';
import { 
  Gift, Calendar, Users, IndianRupee, ChevronDown, 
  Search, X, Award, Percent, DollarSign, RefreshCw, Trash2, Plus, Eye, EyeOff
} from 'lucide-react';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';

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
    <div className="relative flex-1" ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 pr-8 text-left text-sm font-medium text-gray-700 bg-white border rounded-lg transition-all duration-200 flex items-center justify-between ${
          isOpen 
            ? 'border-pink-400 ring-2 ring-pink-100' 
            : 'border-gray-300 hover:border-pink-300'
        }`}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown 
          className={`text-gray-400 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({ target: { value: option.value } });
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                  value === option.value 
                    ? 'bg-pink-50 text-pink-600 font-medium' 
                    : 'text-gray-700 hover:bg-pink-50 hover:text-pink-600'
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

const OfferFilters = memo(({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  sortBy,
  onSortChange,
  onClearFilters,
  viewMode,
  onViewModeChange
}) => {
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'percentage', label: 'Percentage OFF' },
    { value: 'fixed', label: 'Fixed Amount' }
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'discount-high', label: 'Highest Discount' },
    { value: 'discount-low', label: 'Lowest Discount' },
    { value: 'uses-left', label: 'Uses Left' }
  ];
  
  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-pink-500 transition-colors" 
          size={18} 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search offers by title or description..."
          className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 hover:border-pink-300 transition-all"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <CustomSelect
          value={filterType}
          onChange={onFilterTypeChange}
          options={typeOptions}
          placeholder="Filter by type"
        />
        
        <CustomSelect
          value={sortBy}
          onChange={onSortChange}
          options={sortOptions}
          placeholder="Sort by"
        />
        
        <button
          onClick={onClearFilters}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all"
        >
          <RefreshCw size={16} />
          Clear
        </button>

        <button
          onClick={onViewModeChange}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-all shadow-sm"
        >
          {viewMode === 'active' ? (
            <>
              <EyeOff size={16} />
              Show Expired
            </>
          ) : (
            <>
              <Eye size={16} />
              Show Active
            </>
          )}
        </button>
      </div>
    </div>
  );
});

OfferFilters.displayName = 'OfferFilters';

const OfferCard = memo(({ offer, onDelete }) => {
  const discountDisplay = offer.offerType === 'percentage' 
    ? `${offer.discountValue}% OFF`
    : `₹${offer.discountValue} OFF`;
  
  const offerTypeDisplay = offer.offerType === 'percentage' ? 'Percentage OFF' : 'Fixed Amount';
  const currentUses = offer.currentUses || 0;
  const maxUses = offer.maxUses;
  const hasUsesLimit = maxUses && maxUses > 0;
  
  const now = new Date();
  const validUntil = new Date(offer.validUntil);
  const isExpired = !offer.isActive || validUntil.getTime() < now.getTime();

  return (
    <div className={`group relative bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
      isExpired ? 'border-red-200 bg-red-50/20' : 'border-gray-200'
    }`}>
      {isExpired && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-red-500 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-lg transform -rotate-12">
            EXPIRED
          </div>
        </div>
      )}
      
      <div className={`p-5 ${isExpired ? 'opacity-60' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
          <div className="flex-1 w-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <h3 className='text-gray-500 text-green-600'>Service Name : {offer?.applicableService?.name ||''}</h3>
                <p className={`font-semibold text-md mb-1 ${isExpired ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                  {offer.title}
                </p>
                <p className={`text-sm line-clamp-2 ${isExpired ? 'text-gray-400' : 'text-gray-600'}`}>
                  {offer.description}
                </p>
              </div>
              
              <button
                onClick={() => onDelete(offer._id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                isExpired ? 'bg-gray-100 border-gray-200' : 'bg-pink-50 border-pink-200'
              }`}>
                {offer.offerType === 'percentage' ? (
                  <Percent size={12} className={isExpired ? 'text-gray-500' : 'text-pink-600'} />
                ) : (
                  <DollarSign size={12} className={isExpired ? 'text-gray-500' : 'text-pink-600'} />
                )}
                <span className={`text-xs font-medium ${isExpired ? 'text-gray-500' : 'text-pink-700'}`}>
                  {offerTypeDisplay} • {discountDisplay}
                </span>
              </div>
              
              {offer.firstTimeUserOnly && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  isExpired ? 'bg-gray-100 border-gray-200' : 'bg-purple-50 border-purple-200'
                }`}>
                  <Award size={12} className={isExpired ? 'text-gray-500' : 'text-purple-600'} />
                  <span className={`text-xs font-medium ${isExpired ? 'text-gray-500' : 'text-purple-700'}`}>
                    First Time Only
                  </span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">From:</span>
                <span className={`font-medium ${isExpired ? 'text-gray-400' : 'text-gray-700'}`}>
                  {new Date(offer.validFrom).toLocaleDateString()}
                </span>
              </div>
              
              {offer.minAmount > 0 && (
                <div className="flex items-center gap-2">
                  <IndianRupee size={14} className="text-gray-400" />
                  <span className="text-gray-600">Min Spend:</span>
                  <span className={`font-medium ${isExpired ? 'text-gray-400' : 'text-gray-700'}`}>
                    ₹{offer.minAmount}
                  </span>
                </div>
              )}
              
              {hasUsesLimit && (
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  <span className="text-gray-600">Uses Left:</span>
                  <span className={`font-medium ${isExpired ? 'text-gray-400' : 'text-gray-700'}`}>
                    {maxUses - currentUses}/{maxUses}
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">Until:</span>
                <span className={`font-medium ${isExpired ? 'text-red-500 line-through' : 'text-gray-700'}`}>
                  {new Date(offer.validUntil).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OfferCard.displayName = 'OfferCard';

const OfferSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { offers, loading, error } = useSelector((state) => state.offers);
  const { services } = useSelector((state) => state.adminServices);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('active');

  useEffect(() => {
    dispatch(fetchOffers());
    if (!services || services.length === 0) {
      dispatch(fetchAllServices());
    }
  }, [dispatch, services.length]);

  const handleDeleteOffer = useCallback((offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      dispatch(deleteOffer(offerId)).then(() => {
        toast.success('Offer deleted successfully');
        dispatch(fetchOffers());
      });
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    toast.loading('Refreshing offers...', { id: 'refresh' });
    
    try {
      await dispatch(fetchOffers()).unwrap();
      toast.success('Offers refreshed successfully', { id: 'refresh' });
    } catch (error) {
      toast.error('Failed to refresh offers', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const getDiscountValue = useCallback((offer) => offer.discountValue, []);

  const filteredAndSortedOffers = useMemo(() => {
    if (!offers || offers.length === 0) return [];
    
    let filtered = [...offers];
    
    filtered = filtered.filter(offer => {
      if (viewMode === 'active') {
        return offer.isActive === true;
      } else {
        return offer.isActive === false;
      }
    });
    
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(offer =>
        offer.title?.toLowerCase().includes(term) ||
        offer.description?.toLowerCase().includes(term)
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(offer => offer.offerType === filterType);
    }
    
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.validFrom).getTime() - new Date(a.createdAt || a.validFrom).getTime();
        case 'oldest':
          return new Date(a.createdAt || a.validFrom).getTime() - new Date(b.createdAt || b.validFrom).getTime();
        case 'discount-high':
          return getDiscountValue(b) - getDiscountValue(a);
        case 'discount-low':
          return getDiscountValue(a) - getDiscountValue(b);
        case 'uses-left':
          const aLeft = (a.maxUses || Infinity) - (a.currentUses || 0);
          const bLeft = (b.maxUses || Infinity) - (b.currentUses || 0);
          return bLeft - aLeft;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [offers, searchTerm, filterType, sortBy, viewMode, getDiscountValue]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterType('all');
    setSortBy('newest');
  }, []);

  const handleViewModeChange = useCallback(() => {
    setViewMode(prev => prev === 'active' ? 'expired' : 'active');
  }, []);

  const handleCreateOffer = () => {
    navigate('/admin/new-offer');
  };

  if (loading && !offers.length) {
    return <AdminLoading text="Loading offers" icon={Gift} color="pink" />;
  }

  if (error && !offers.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Offers"
        icon="alert"
        showRetry={true}
      />
    );
  }
  
  if ( !loading && offers && offers.length === 0) {
    return (
      <EmptyState 
        title="No Offers Found"
        message="Click the button below to create your first offer."
        icon="Gift"
        showAction={true}
        actionText="Create Offer"
        onAction={handleCreateOffer}
      />
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-linear-to-br from-pink-50 to-pink-100 rounded-xl">
            <Gift className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Special Offers</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {filteredAndSortedOffers.length} {viewMode === 'active' ? 'Active' : 'Expired'} {filteredAndSortedOffers.length === 1 ? 'Offer' : 'Offers'}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreateOffer}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-pink-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-sm"
          >
            <Plus size={16} />
            Create Offer
          </button>
        </div>
      </div>

      <OfferFilters
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        filterType={filterType}
        onFilterTypeChange={(e) => setFilterType(e.target.value)}
        sortBy={sortBy}
        onSortChange={(e) => setSortBy(e.target.value)}
        onClearFilters={clearFilters}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {(searchTerm || filterType !== 'all') && (
        <div className="flex flex-wrap gap-2 mt-4">
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-pink-50 text-pink-600 rounded-lg">
              Search: {searchTerm}
              <button onClick={() => setSearchTerm('')} className="hover:text-pink-800">
                <X size={12} />
              </button>
            </span>
          )}
          {filterType !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-pink-50 text-pink-600 rounded-lg">
              Type: {filterType === 'percentage' ? 'Percentage OFF' : 'Fixed Amount'}
              <button onClick={() => setFilterType('all')} className="hover:text-pink-800">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {filteredAndSortedOffers.length === 0 && (
        <div className="mt-6">
          <EmptyState
            title={`No ${viewMode === 'active' ? 'active' : 'expired'} offers found`}
            message={viewMode === 'active' 
              ? 'Try adjusting your search or filter criteria'
              : 'No expired offers available at this moment'}
            icon="search"
            showAction={false}
          />
        </div>
      )}

      {filteredAndSortedOffers.length > 0 && (
        <div className="grid gap-4 mt-6">
          {filteredAndSortedOffers.map((offer) => (
            <OfferCard
              key={offer._id}
              offer={offer}
              onDelete={handleDeleteOffer}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OfferSection;
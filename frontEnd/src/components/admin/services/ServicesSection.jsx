import React, { memo, useMemo, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, ChevronDown, Package, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from './ServiceCard';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';
import AdminLoading from '../../../common/AdminLoading';
import { fetchAllServices } from '../../../redux/slices/adminServiceSlice';
import toast from 'react-hot-toast';
import ServiceSkeletonGrid from '../../../common/ServiceSkeleton';

const ServicesSection = memo(() => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { services, loading, error } = useSelector((state) => state.adminServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const categories = useMemo(() => {
    if (!services || services.length === 0) return ['all'];
    const uniqueCategories = [...new Set(services.map(service => service.categoryTitle))];
    return ['all', ...uniqueCategories];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (!services || services.length === 0) return [];
    return services.filter(service => {
      const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.desc?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || service.categoryTitle === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing services...');
    try {
      await dispatch(fetchAllServices()).unwrap();
      toast.success('Services refreshed successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to refresh services', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleAddService = () => {
    navigate('/admin/add-service');
  };

  if (loading) {
    return <ServiceSkeletonGrid text="Loading services" icon={Package} color="purple" />;
  }

  
  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Services"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!services || services.length === 0) {
    return (
      <EmptyState
        title="No Services Found"
        message="You haven't added any services yet. Click the button below to add your first service."
        icon="package"
        showAction={true}
        actionText="Add Your First Service"
        onAction={handleAddService}
      />
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-0">
      <div className="mb-6 flex justify-between flex-wrap gap-2 items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your service offerings and details</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleAddService}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>
      </div>

      <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services by name or description..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-xs sm:placeholder:text-sm placeholder-gray-400"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-400 transition-colors w-full sm:min-w-[180px] md:min-w-[200px] text-xs sm:text-sm"
          >
            <span className="text-gray-700 truncate">
              {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-purple-50 transition-colors ${
                      selectedCategory === category 
                        ? 'bg-purple-100 text-purple-700 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    {category === 'all' ? 'All Categories' : category}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {filteredServices.length === 0 ? (
        <EmptyState
          title="No services found"
          message={searchTerm || selectedCategory !== 'all' 
            ? 'Try adjusting your search or filter criteria'
            : 'Click the "Add Service" button to create your first service'}
          icon="search"
          showAction={false}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ServicesSection;
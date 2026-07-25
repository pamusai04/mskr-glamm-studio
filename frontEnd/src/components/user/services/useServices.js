
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, setActiveFilter, filterServices, fetchServices, clearError } from '../../../redux/slices/servicesSlice';
import { fetchUserOffers } from '../../../redux/slices/userOfferSlice';
import toast from 'react-hot-toast';

export const useServices = () => {
  const dispatch = useDispatch();
  const [openCategory, setOpenCategory] = useState(0);
  const [showSearchMobile, setShowSearchMobile] = useState(false);
  
  // Services state
  const filteredServices = useSelector((state) => state.services.filteredServices);
  const searchQuery = useSelector((state) => state.services.searchQuery);
  const activeFilter = useSelector((state) => state.services.activeFilter);
  const loading = useSelector((state) => state.services.loading);
  const error = useSelector((state) => state.services.error);
  const servicesLoaded = useSelector((state) => state.services.servicesLoaded);
  
  // Offers state
  const offers = useSelector((state) => state.userOffers.offers);
  const offersLoading = useSelector((state) => state.userOffers.loading);
  const offersError = useSelector((state) => state.userOffers.error);
  const offersLoaded = useSelector((state) => state.userOffers.offersLoaded);
  const cart = useSelector((state) => state.cart.cart);

  // Fetch services on mount if not loaded
  useEffect(() => {
    if (!servicesLoaded && filteredServices.length === 0) {
      dispatch(fetchServices());
    }
  }, [dispatch, servicesLoaded, filteredServices.length]);

  // Fetch offers on mount if not loaded
  useEffect(() => {
    if (!offersLoaded && (!offers || offers.length === 0)) {
      dispatch(fetchUserOffers());
    }
  }, [dispatch, offersLoaded, offers]);

  const handleSearchChange = useCallback((e) => {
    dispatch(setSearchQuery(e.target.value));
    dispatch(filterServices());
  }, [dispatch]);

  const handleFilterChange = useCallback((filter) => {
    dispatch(setActiveFilter(filter));
    dispatch(filterServices());
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(setSearchQuery(''));
    dispatch(setActiveFilter('all'));
    dispatch(filterServices());
  }, [dispatch]);

  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchServices());
  }, [dispatch]);

  const handleToggleCategory = useCallback((index) => {
    setOpenCategory(prev => prev === index ? -1 : index);
  }, []);

  return {
    // Services
    filteredServices,
    searchQuery,
    activeFilter,
    loading,
    error,
    openCategory,
    showSearchMobile,
    setShowSearchMobile,
    handleSearchChange,
    handleFilterChange,
    handleReset,
    handleRetry,
    handleToggleCategory,
    hasResults: filteredServices && filteredServices.length > 0,
    
    // Offers
    offers,
    offersLoading,
    offersError,
    offersLoaded
  };
};
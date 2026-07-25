import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getReviews, resetFetched } from "../../redux/slices/reviewSlice";
import ReviewsSkeleton from "../../common/ReviewsSkeleton";
import ErrorState from "../../common/ErrorState";
import { ReviewCard, RatingBreakdown, ReviewFilters } from "../../components/user/review";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      duration: 0.5
    }
  }
};

const headerVariants = {
  hidden: { 
    opacity: 0,
    y: -30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100,
      duration: 0.6
    }
  }
};

const filterVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      delay: 0.3
    }
  }
};

const ReviewsPage = () => {
  const dispatch = useDispatch();
  const reviewsContainerRef = useRef(null);
  const hasScrolled = useRef(false);
  
  const { reviews: reduxReviews, loading, error, fetched, success } = useSelector((state) => state.review);
  
  const [filter, setFilter] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if ( reviewsContainerRef.current && !loading && reduxReviews.length > 0) {

      setTimeout(() => {
        const navbarHeight = 120;
        const elementPosition = reviewsContainerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [loading, reduxReviews.length]);

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(getReviews());
    }
  }, [dispatch, fetched, loading]);

  useEffect(() => {
    if (success) {
      dispatch(resetFetched());
      dispatch(getReviews());
    }
  }, [success, dispatch]);

  const serviceNames = useMemo(() => {
    const services = [...new Set(reduxReviews.map(r => r.serviceName).filter(Boolean))];
    return services.sort();
  }, [reduxReviews]);

  const averageRating = useMemo(() => {
    if (reduxReviews.length === 0) return '0.0';
    const sum = reduxReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reduxReviews.length).toFixed(1);
  }, [reduxReviews]);

  const filteredReviews = useMemo(() => {
    return reduxReviews.filter(review => {
      if (filter !== 'all' && review.rating !== parseInt(filter)) return false;
      
      if (selectedService !== 'all' && review.serviceName !== selectedService) return false;
      
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase().trim();
        const serviceNameMatch = review.serviceName?.toLowerCase().includes(searchLower);
        const reviewMessageMatch = (review.reviewMessage || review.reviewText)?.toLowerCase().includes(searchLower);
        return serviceNameMatch || reviewMessageMatch;
      }
      
      return true;
    });
  }, [reduxReviews, filter, selectedService, searchTerm]);

  const handleFilterChange = useCallback((e) => setFilter(e.target.value), []);
  const handleServiceChange = useCallback((e) => setSelectedService(e.target.value), []);
  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleRetry = useCallback(() => {
    dispatch(resetFetched());
    dispatch(getReviews());
  }, [dispatch]);

  if (loading && !fetched) {
    return <ReviewsSkeleton />;
  }

  if (error && !reduxReviews.length) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-10 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={headerVariants}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">Customer Reviews</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">See what our clients are saying about their experience</p>
            </div>
            <Link
              to="/write-review"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#663399] text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg hover:bg-[#552988] transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-medium text-xs sm:text-sm md:text-base"
            >
              <Plus size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              Write a Review
            </Link>
          </motion.div>
          <ErrorState 
            message={typeof error === 'string' ? error : 'Failed to load reviews'} 
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pt-15 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <motion.div
          ref={reviewsContainerRef}
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="flex flex-col text-center sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div className="text-center sm:text-left">
            <motion.h1 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Customer Reviews
            </motion.h1>
            <motion.p 
              className="text-xs sm:text-sm md:text-base text-gray-600"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              See what our clients are saying about their experience
            </motion.p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              to="/write-review"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#663399] text-white px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg hover:bg-[#552988] transition-all duration-200 shadow-md hover:shadow-lg font-medium text-xs sm:text-sm md:text-base"
            >
              <Plus size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              Write a Review
            </Link>
          </motion.div>
        </motion.div>

        {reduxReviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <RatingBreakdown reviews={reduxReviews} averageRating={averageRating} />
          </motion.div>
        )}

        <motion.div
          variants={filterVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 sm:mb-8"
        >
          <ReviewFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            filter={filter}
            onFilterChange={handleFilterChange}
            selectedService={selectedService}
            onServiceChange={handleServiceChange}
            serviceNames={serviceNames}
          />
        </motion.div>

        {loading && fetched && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 sm:h-3.5 md:h-4 bg-gray-200 rounded w-20 sm:w-24 mb-1.5 sm:mb-2"></div>
                      <div className="h-2 sm:h-2.5 md:h-3 bg-gray-200 rounded w-28 sm:w-32"></div>
                    </div>
                  </div>
                  <div className="h-3 sm:h-3.5 md:h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 sm:h-3.5 md:h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredReviews.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8 sm:py-10 md:py-12 bg-white rounded-xl shadow-lg"
          >
            <div className="text-gray-400 mb-3 sm:mb-4">
              <Star size={48} className="sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-5 sm:mb-6">Be the first to share your experience</p>
            <Link
              to="/write-review"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#663399] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg hover:bg-[#552988] transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
            >
              <Plus size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
              Write a Review
            </Link>
          </motion.div>
        )}

        {!loading && filteredReviews.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-500"
            >
              Showing {filteredReviews.length} of {reduxReviews.length} reviews
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {filteredReviews.map((review, index) => (
                <motion.div
                  key={review._id || review.id || `review-${index}`}
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.2 }
                  }}
                  viewport={{ once: true }}
                >
                  <ReviewCard review={review} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ReviewsPage);
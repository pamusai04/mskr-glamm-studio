import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Star, Trash2, RefreshCw, User, Search, ChevronLeft, ChevronRight, X, MessageCircleDashed } from 'lucide-react';
import { fetchAllReviews, deleteReview } from '../../../redux/slices/adminReviewSlice';
import toast from 'react-hot-toast';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';

const ReviewsSection = () => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.adminReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  const filteredReviews = useMemo(() => {
    if (!reviews || reviews.length === 0) return [];
    if (!searchTerm) return reviews;
    
    const searchLower = searchTerm.toLowerCase();
    return reviews.filter(review =>
      review.userId?.fullName?.toLowerCase().includes(searchLower) ||
      review.serviceName?.toLowerCase().includes(searchLower) ||
      review.reviewMessage?.toLowerCase().includes(searchLower)
    );
  }, [reviews, searchTerm]);

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReviews, currentPage, itemsPerPage]);

  const statistics = useMemo(() => {
    const total = filteredReviews.length;
    const average = total > 0
      ? (filteredReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / total).toFixed(1)
      : 0;
    return { total, average };
  }, [filteredReviews]);

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const handleDelete = useCallback(async (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const result = await dispatch(deleteReview(reviewId));
      if (!result.error) {
        toast.success('Review deleted successfully');
        dispatch(fetchAllReviews());
        setSelectedReview(null);
        if (paginatedReviews.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        toast.error(result.payload || 'Failed to delete review');
      }
    }
  }, [dispatch, paginatedReviews.length, currentPage]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing reviews...');
    try {
      await dispatch(fetchAllReviews()).unwrap();
      toast.success('Reviews refreshed successfully', { id: toastId });
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      toast.error('Failed to refresh reviews', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCurrentPage(1);
    toast.success('Filters cleared');
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  if (loading && !reviews.length) {
    return <AdminLoading text="Loading reviews" icon={MessageCircleDashed} color="amber" />;
  }

  if (error && !reviews.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Reviews"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!loading && reviews && reviews.length === 0) {
    return (
      <EmptyState
        title="No Reviews Found"
        message="No reviews are available at the moment."
        icon="default"
        showAction={false}
      />
    );
  }

  return (
    <div className='p-3 md:p-0'>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">View and moderate customer reviews</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, service or review..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-amber-50 rounded-lg px-4 py-3 flex-1">
          <p className="text-sm text-amber-600 font-medium">Total Reviews</p>
          <p className="text-2xl font-bold text-amber-700">{statistics.total}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg px-4 py-3 flex-1">
          <p className="text-sm text-yellow-600 font-medium">Average Rating</p>
          <p className="text-2xl font-bold text-yellow-700">{statistics.average} ⭐</p>
        </div>
      </div>

      {searchTerm && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{paginatedReviews.length}</span> of{' '}
            <span className="font-medium text-gray-900">{filteredReviews.length}</span> reviews
          </div>
          <button onClick={resetFilters} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            Clear filters
          </button>
        </div>
      )}

      {filteredReviews.length === 0 && searchTerm ? (
        <EmptyState
          title="No reviews found"
          message="Try adjusting your search criteria"
          icon="search"
          showAction={false}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedReviews.map((review) => (
              <div 
                key={review._id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedReview(review)}
              >
                <div className="relative">
                  {review.serviceImage && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={review.serviceImage} 
                        alt={review.serviceName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-white ml-1">({review.rating})</span>
                  </div>
                </div>
                
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                        {review.userId?.profilePhoto?.url ? (
                          <img 
                            src={review.userId.profilePhoto.url} 
                            alt={review.userId.fullName} 
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-xs">{review.userId?.fullName?.split(' ')[0] || 'User'}</h4>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(review._id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4 inline mr-1" />
                Previous
              </button>
              
              <div className="flex gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-amber-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          )}
        </>
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Review Details</h3>
              <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {selectedReview.serviceImage && (
                <div className="w-full h-64 rounded-md overflow-hidden bg-gray-100 mb-4">
                  <img 
                    src={selectedReview.serviceImage} 
                    alt={selectedReview.serviceName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                    {selectedReview.userId?.profilePhoto?.url ? (
                      <img 
                        src={selectedReview.userId.profilePhoto.url} 
                        alt={selectedReview.userId.fullName} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{selectedReview.userId?.fullName}</h4>
                    <p className="text-xs text-gray-400">{selectedReview.userId?.emailId}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(selectedReview.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">({selectedReview.rating}/5)</span>
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-amber-600 mb-1">{selectedReview.serviceName}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedReview.reviewMessage}</p>
              </div>

              <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                Submitted: {new Date(selectedReview.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2">
              <button
                onClick={() => handleDelete(selectedReview._id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                Delete Review
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
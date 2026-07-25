import React, { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Search, Grid3x3, List, Home, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateBookingStatus, fetchAllBookings } from '../../../redux/slices/adminBookingSlice';
import BookingModals from './BookingModals';
import BookingList from './BookingList';
import AdminLoading from '../../../common/AdminLoading';
import EmptyState from '../../../common/EmptyState';
import ErrorState from '../../../common/ErrorState';

const statusOptions = [
  {
    key: "all",
    label: "All",
    active: "bg-cyan-600 text-white shadow-md",
    inactive: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  {
    key: "pending",
    label: "Pending",
    active: "bg-yellow-500 text-white shadow-md",
    inactive: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    active: "bg-blue-500 text-white shadow-md",
    inactive: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  {
    key: "completed",
    label: "Completed",
    active: "bg-green-500 text-white shadow-md",
    inactive: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    active: "bg-red-500 text-white shadow-md",
    inactive: "bg-red-100 text-red-800 hover:bg-red-200",
  },
  {
    key: "homeService",
    label: "Home Service",
    icon: Home,
    active: "bg-cyan-600 text-white shadow-md",
    inactive: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  },
];

const ManageBookings = memo(() => {
  const dispatch = useDispatch();
  const { bookings, loading, error, updatingStatus } = useSelector((state) => state.adminBookings);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState('table');
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAllBookings());
  }, [dispatch]);
  
  const filteredBookings = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];
    
    let filtered = [...bookings];
    
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'homeService') {
        filtered = filtered.filter(booking => booking.homeService === true);
      } else {
        filtered = filtered.filter(booking => booking.status === selectedStatus);
      }
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.fullName?.toLowerCase().includes(searchLower) ||
        booking.emailId?.toLowerCase().includes(searchLower) ||
        booking.phoneNumber?.toLowerCase().includes(searchLower) ||
        booking.serviceItemIds?.some(item => item.name?.toLowerCase().includes(searchLower))
      );
    }
    
    filtered.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
    return filtered;
  }, [bookings, selectedStatus, searchTerm]);
  
  const statusCounts = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, homeService: 0 };
    }
    return {
      all: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      homeService: bookings.filter(b => b.homeService === true).length
    };
  }, [bookings]);
  
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  
  const handleStatusUpdate = useCallback(async (bookingId, status, reason = '') => {
    const result = await dispatch(updateBookingStatus({ bookingId, status, reason }));
    if (!result.error) {
      if (status === 'cancelled') {
        toast.success(reason ? `Booking cancelled: ${reason}` : 'Booking cancelled successfully');
      } else if (status === 'confirmed') {
        toast.success('Booking confirmed successfully');
      } else if (status === 'completed') {
        toast.success('Service completed successfully!');
      } else {
        toast.success('Booking status updated successfully');
      }
      
      await dispatch(fetchAllBookings());
      setCancellingId(null);
      setCancellationReason('');
      setSelectedBooking(null);
    } else {
      toast.error(result.payload || 'Failed to update status');
    }
  }, [dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const toastId = toast.loading('Refreshing bookings...');
    try {
      await dispatch(fetchAllBookings()).unwrap();
      toast.success('Bookings refreshed successfully', { id: toastId });
    } catch (error) {
      toast.error('Failed to refresh bookings', { id: toastId });
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus('all');
    setCurrentPage(1);
    toast.success('Filters cleared');
  }, []);
  
  if (loading && !bookings.length) {
    return <AdminLoading text="Loading bookings" icon={Calendar} color="cyan" />;
  }

  if (error && !bookings.length) {
    return (
      <ErrorState 
        error={error}
        onRetry={handleRefresh}
        title="Failed to Load Bookings"
        icon="alert"
        showRetry={true}
      />
    );
  }

  if (!loading && bookings && bookings.length === 0) {
    return (
      <EmptyState 
        title="No Bookings Found"
        message="There are no bookings available at this moment."
        icon="default"
      />
    );
  }
  
  return (
    <div className='p-3'>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all customer bookings</p>
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
            placeholder="Search by name, email, phone or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-900 placeholder-gray-400 bg-white"
          />
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700 transition-all duration-200 bg-white"
        >
          {viewMode === 'table' ? (
            <>
              <Grid3x3 className="w-4 h-4" />
              Card View
            </>
          ) : (
            <>
              <List className="w-4 h-4" />
              Table View
            </>
          )}
        </button>
      </div>

      <div className="w-full mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          {statusOptions.map((status) => {
            const Icon = status.icon;
            return (
              <button
                key={status.key}
                onClick={() => setSelectedStatus(status.key)}
                className={`px-9 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
                  selectedStatus === status.key ? status.active : status.inactive
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {status.label} ({statusCounts[status.key] || 0})
              </button>
            );
          })}
        </div>
      </div>
      
      {searchTerm && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{paginatedBookings.length}</span> of{' '}
            <span className="font-medium text-gray-900">{filteredBookings.length}</span> bookings
          </div>
          <button onClick={resetFilters} className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
            Clear filters
          </button>
        </div>
      )}
      
      {bookings && bookings.length > 0 && (
        <>
          <BookingList
            bookings={paginatedBookings}
            viewMode={viewMode}
            updatingStatus={updatingStatus}
            onViewDetails={setSelectedBooking}
            onStatusUpdate={handleStatusUpdate}
            onCancel={setCancellingId}
          />
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-cyan-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
      
      <BookingModals
        selectedBooking={selectedBooking}
        cancellingId={cancellingId}
        cancellationReason={cancellationReason}
        updatingStatus={updatingStatus}
        onCloseDetails={() => setSelectedBooking(null)}
        onCloseCancel={() => {
          setCancellingId(null);
          setCancellationReason('');
        }}
        onReasonChange={setCancellationReason}
        onConfirmCancel={() => handleStatusUpdate(cancellingId, 'cancelled', cancellationReason)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
});

ManageBookings.displayName = 'ManageBookings';
export default ManageBookings;
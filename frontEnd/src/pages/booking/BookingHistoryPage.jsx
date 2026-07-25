// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { getBookingHistory } from '../../redux/slices/bookingSlice';
// import BookingHistoryCard from '../../components/BookingHistoryCard';
// import BookingHistoryCardSkeleton from '../../common/BookingHistorySkeleton';
// import { Calendar, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';
// import EmptyState from '../../common/EmptyState';
// import ErrorState from '../../common/ErrorState';

// const BookingHistoryPage = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { bookings, loading, error } = useSelector((state) => state.booking);
//   const [activeTab, setActiveTab] = useState('all');
//   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//   const [showFilters, setShowFilters] = useState(true);
//   const [isFilterApplied, setIsFilterApplied] = useState(false);
//   const [monthOpen, setMonthOpen] = useState(false);
//   const [yearOpen, setYearOpen] = useState(false);
//   const [initialFetchDone, setInitialFetchDone] = useState(false);

//   // Only fetch if bookings data doesn't exist and we haven't fetched yet
//   useEffect(() => {
//     if (!loading && !error && bookings.length === 0 && !initialFetchDone) {
//       dispatch(getBookingHistory());
//       setInitialFetchDone(true);
//     }
//   }, [dispatch, loading, error, bookings.length, initialFetchDone]);

//   const handleRefresh = useCallback(async () => {
//     await dispatch(getBookingHistory()).unwrap();
//   }, [dispatch]);

//   const handleBrowseServices = useCallback(() => {
//     navigate('/services');
//   }, [navigate]);

//   const handleBookService = useCallback(() => {
//     navigate('/services');
//   }, [navigate]);

//   const filterByMonth = useMemo(() => {
//     return (bookingsList) => {
//       if (!isFilterApplied) return bookingsList;
//       return bookingsList.filter(booking => {
//         const bookingDate = new Date(booking.serviceDate);
//         return bookingDate.getMonth() === selectedMonth && 
//                bookingDate.getFullYear() === selectedYear;
//       });
//     };
//   }, [selectedMonth, selectedYear, isFilterApplied]);

//   const getAllBookings = useMemo(() => {
//     const all = bookings.filter(booking => booking.status !== 'cancelled');
//     return [...all].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
//   }, [bookings]);

//   const getUpcomingBookings = useMemo(() => {
//     const upcoming = bookings.filter(booking => booking.status === 'pending');
//     return [...upcoming].sort((a, b) => new Date(a.serviceDate) - new Date(b.serviceDate));
//   }, [bookings]);

//   const getCompletedBookings = useMemo(() => {
//     const completed = bookings.filter(booking => booking.status === 'completed');
//     return [...completed].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
//   }, [bookings]);

//   const getCancelledBookings = useMemo(() => {
//     const cancelled = bookings.filter(booking => booking.status === 'cancelled');
//     return [...cancelled].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
//   }, [bookings]);

//   const getFilteredBookings = () => {
//     switch (activeTab) {
//       case 'all':
//         return filterByMonth(getAllBookings);
//       case 'upcoming':
//         return filterByMonth(getUpcomingBookings);
//       case 'completed':
//         return filterByMonth(getCompletedBookings);
//       case 'cancelled':
//         return filterByMonth(getCancelledBookings);
//       default:
//         return [];
//     }
//   };

//   const filteredBookings = getFilteredBookings();
  
//   const allCount = getAllBookings.length;
//   const upcomingCount = getUpcomingBookings.length;
//   const completedCount = getCompletedBookings.length;
//   const cancelledCount = getCancelledBookings.length;

//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   const years = useMemo(() => {
//     if (!bookings || bookings.length === 0) {
//       return [new Date().getFullYear()];
//     }

//     const uniqueYears = [
//       ...new Set(
//         bookings.map((booking) =>
//           new Date(booking.serviceDate).getFullYear()
//         )
//       ),
//     ];

//     return uniqueYears.sort((a, b) => b - a);
//   }, [bookings]);

//   const handlePreviousMonth = () => {
//     if (selectedMonth === 0) {
//       setSelectedMonth(11);
//       setSelectedYear(selectedYear - 1);
//     } else {
//       setSelectedMonth(selectedMonth - 1);
//     }
//     setIsFilterApplied(true);
//   };

//   const handleNextMonth = () => {
//     if (selectedMonth === 11) {
//       setSelectedMonth(0);
//       setSelectedYear(selectedYear + 1);
//     } else {
//       setSelectedMonth(selectedMonth + 1);
//     }
//     setIsFilterApplied(true);
//   };

//   const handleMonthChange = (e) => {
//     setSelectedMonth(parseInt(e.target.value));
//     setIsFilterApplied(true);
//   };

//   const handleYearChange = (e) => {
//     setSelectedYear(parseInt(e.target.value));
//     setIsFilterApplied(true);
//   };

//   const handleClearFilter = () => {
//     setIsFilterApplied(false);
//     setSelectedMonth(new Date().getMonth());
//     setSelectedYear(new Date().getFullYear());
//   };

//   const renderContent = () => {
//     // Loading state with skeleton
//     if (loading) {
//       return <BookingHistoryCardSkeleton />;
//     }

//     // Error state using reusable ErrorState component
//     if (error) {
//       return (
//         <ErrorState
//           error={error}
//           onRetry={handleRefresh}
//           title="Failed to Load Bookings"
//           icon="alert"
//           showRetry={true}
//         />
//       );
//     }

//     // Empty state - No bookings at all
//     if (bookings.length === 0) {
//       return (
//         <EmptyState
//           title="No Bookings Found"
//           message="You haven't made any bookings yet. Browse our services and book your first appointment!"
//           icon="Calendar"
//           showAction={true}
//           actionText="Browse Services"
//           onAction={handleBrowseServices}
//         />
//       );
//     }

//     // Filter applied but no results
//     if (filteredBookings.length === 0 && isFilterApplied) {
//       return (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//           <h3 className="text-lg font-medium text-gray-700 mb-2">No Bookings Found</h3>
//           <p className="text-gray-500">
//             No {activeTab === 'all' ? '' : activeTab} bookings found for {months[selectedMonth]} {selectedYear}
//           </p>
//           <button
//             onClick={handleClearFilter}
//             className="mt-4 px-4 py-2 bg-[#336699] text-white rounded-md hover:bg-[#2A5480] transition"
//           >
//             Clear Filter
//           </button>
//         </div>
//       );
//     }

//     // Tab has no bookings
//     if (filteredBookings.length === 0 && !isFilterApplied) {
//       return (
//         <EmptyState
//           title={`No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings`}
//           message={`You don't have any ${activeTab} bookings yet.`}
//           icon="Calendar"
//           showAction={activeTab === 'all' || activeTab === 'upcoming'}
//           actionText={activeTab === 'all' ? "Browse Services" : "Book a Service"}
//           onAction={activeTab === 'all' ? handleBrowseServices : handleBookService}
//         />
//       );
//     }

//     // Main content - bookings list
//     return (
//       <div className="space-y-4">
//         {filteredBookings.map((booking) => (
//           <BookingHistoryCard key={booking._id} booking={booking} />
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pt-8 pb-20 smooth-scroll">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
//               <p className="mt-2 text-gray-600">View and manage all your service bookings</p>
//             </div>
//             <button
//               onClick={() => setShowFilters(!showFilters)}
//               className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
//             >
//               <Filter className="w-4 h-4 text-gray-600" />
//               <span className="text-sm text-gray-700 font-medium ">
//                 {showFilters ? 'Hide Filters' : 'Show Filters'}
//               </span>
//             </button>
//           </div>

//           {showFilters && (
//             <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 mb-6 border border-gray-200">
//               <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
//                 <button
//                   onClick={handlePreviousMonth}
//                   className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0"
//                 >
//                   <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
//                 </button>

//                 <div className="relative flex-1 min-w-[80px] max-w-[140px] sm:max-w-[160px]">
//                   <button
//                     onClick={() => {
//                       setMonthOpen(!monthOpen);
//                       setYearOpen(false);
//                     }}
//                     className="w-full px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium flex items-center justify-between text-[11px] sm:text-xs md:text-sm"
//                   >
//                     <span className="truncate">{months[selectedMonth]}</span>
//                     <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition duration-200 flex-shrink-0 ml-1 ${monthOpen ? "rotate-180" : ""}`} />
//                   </button>
//                   {monthOpen && (
//                     <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#663399]/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
//                       <div className="py-1">
//                         {months.map((month, index) => (
//                           <button
//                             key={index}
//                             onClick={() => {
//                               handleMonthChange({ target: { value: index } });
//                               setMonthOpen(false);
//                             }}
//                             className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm transition-all duration-150 ${
//                               selectedMonth === index
//                                 ? "bg-[#663399]/10 text-[#663399] font-medium"
//                                 : "text-gray-600 hover:bg-[#663399]/10 hover:text-[#663399]"
//                             }`}
//                           >
//                             {month}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="relative flex-1 min-w-[60px] max-w-[90px] sm:max-w-[120px]">
//                   <button
//                     onClick={() => {
//                       setYearOpen(!yearOpen);
//                       setMonthOpen(false);
//                     }}
//                     className="w-full px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium flex items-center justify-between text-[11px] sm:text-xs md:text-sm"
//                   >
//                     <span>{selectedYear}</span>
//                     <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition duration-200 flex-shrink-0 ml-1 ${yearOpen ? "rotate-180" : ""}`} />
//                   </button>
//                   {yearOpen && (
//                     <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#663399]/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
//                       <div className="py-1">
//                         {years.map((year) => (
//                           <button
//                             key={year}
//                             onClick={() => {
//                               handleYearChange({ target: { value: year } });
//                               setYearOpen(false);
//                             }}
//                             className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm transition-all duration-150 ${
//                               selectedYear === year
//                                 ? "bg-[#663399]/10 text-[#663399] font-medium"
//                                 : "text-gray-600 hover:bg-[#663399]/10 hover:text-[#663399]"
//                             }`}
//                           >
//                             {year}
//                           </button>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleNextMonth}
//                   className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0"
//                 >
//                   <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
//                 </button>
//               </div>

//               <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
//                 <div className="flex flex-wrap gap-2 cursor-pointer text-[11px] sm:text-xs md:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg font-medium">
//                   <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1 sm:mb-1.5 md:mb-2" /> 
//                   {months[selectedMonth]} {selectedYear}
//                 </div>
//                 {isFilterApplied && (
//                   <button
//                     onClick={handleClearFilter}
//                     className="cursor-pointer text-[11px] sm:text-xs md:text-sm text-red-600 hover:text-red-700 font-medium px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-1"
//                   >
//                     <span>✕</span>
//                     <span className="hidden sm:inline">Clear</span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
           
//           {isFilterApplied && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
//               <p className="text-sm text-blue-700">
//                 🔍 Showing bookings for <strong>{months[selectedMonth]} {selectedYear}</strong> | 
//                 <button
//                   onClick={handleClearFilter}
//                   className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
//                 >
//                   Show all bookings
//                 </button>
//               </p>
//             </div>
//           )}

//           {!showFilters && !isFilterApplied && bookings.length > 0 && (
//             <div className="bg-linear-to-r from-[#E6F0FA] to-[#F0F6FD] rounded-lg p-4 mb-6 border border-[#B8D1E8]">
//               <p className="text-sm text-gray-700">
//                 Showing <span className="font-semibold text-[#663399]">{filteredBookings.length}</span> {activeTab} bookings
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="border-b border-gray-200 mb-6">
//           <nav className="-mb-px flex space-x-8 overflow-x-auto">
//             <button
//               onClick={() => setActiveTab('all')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
//                 activeTab === 'all'
//                   ? 'border-[#336699] text-[#336699]'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               All Bookings
//               {allCount > 0 && (
//                 <span className="ml-2 bg-[#336699] text-white px-2 py-0.5 rounded-full text-xs">
//                   {allCount}
//                 </span>
//               )}
//             </button>
//             <button
//               onClick={() => setActiveTab('upcoming')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
//                 activeTab === 'upcoming'
//                   ? 'border-[#336699] text-[#336699]'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Upcoming
//               {upcomingCount > 0 && (
//                 <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
//                   {upcomingCount}
//                 </span>
//               )}
//             </button>
//             <button
//               onClick={() => setActiveTab('completed')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
//                 activeTab === 'completed'
//                   ? 'border-[#336699] text-[#336699]'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Completed
//               {completedCount > 0 && (
//                 <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
//                   {completedCount}
//                 </span>
//               )}
//             </button>
//             <button
//               onClick={() => setActiveTab('cancelled')}
//               className={`py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
//                 activeTab === 'cancelled'
//                   ? 'border-red-500 text-red-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               Cancelled
//               {cancelledCount > 0 && (
//                 <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
//                   {cancelledCount}
//                 </span>
//               )}
//             </button>
//           </nav>
//         </div>

//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default BookingHistoryPage;

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getBookingHistory } from '../../redux/slices/bookingSlice';
import BookingHistoryCard from '../../components/BookingHistoryCard';
import BookingHistoryCardSkeleton from '../../common/BookingHistorySkeleton';
import { Calendar, ChevronLeft, ChevronRight, Filter, ChevronDown } from 'lucide-react';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';

const BookingHistoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading, error } = useSelector((state) => state.booking);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showFilters, setShowFilters] = useState(true);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  // Only fetch if bookings data doesn't exist and we haven't fetched yet
  useEffect(() => {
    if (!loading && !error && bookings.length === 0 && !initialFetchDone) {
      dispatch(getBookingHistory());
      setInitialFetchDone(true);
    }
  }, [dispatch, loading, error, bookings.length, initialFetchDone]);

  const handleRefresh = useCallback(async () => {
    await dispatch(getBookingHistory()).unwrap();
  }, [dispatch]);

  const handleBrowseServices = useCallback(() => {
    navigate('/services');
  }, [navigate]);

  const handleBookService = useCallback(() => {
    navigate('/services');
  }, [navigate]);

  const filterByMonth = useMemo(() => {
    return (bookingsList) => {
      if (!isFilterApplied) return bookingsList;
      return bookingsList.filter(booking => {
        const bookingDate = new Date(booking.serviceDate);
        return bookingDate.getMonth() === selectedMonth && 
               bookingDate.getFullYear() === selectedYear;
      });
    };
  }, [selectedMonth, selectedYear, isFilterApplied]);

  const getAllBookings = useMemo(() => {
    const all = bookings.filter(booking => booking.status !== 'cancelled');
    return [...all].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
  }, [bookings]);

  const getUpcomingBookings = useMemo(() => {
    const upcoming = bookings.filter(booking => booking.status === 'pending');
    return [...upcoming].sort((a, b) => new Date(a.serviceDate) - new Date(b.serviceDate));
  }, [bookings]);

  const getCompletedBookings = useMemo(() => {
    const completed = bookings.filter(booking => booking.status === 'completed');
    return [...completed].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
  }, [bookings]);

  const getCancelledBookings = useMemo(() => {
    const cancelled = bookings.filter(booking => booking.status === 'cancelled');
    return [...cancelled].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));
  }, [bookings]);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'all':
        return filterByMonth(getAllBookings);
      case 'upcoming':
        return filterByMonth(getUpcomingBookings);
      case 'completed':
        return filterByMonth(getCompletedBookings);
      case 'cancelled':
        return filterByMonth(getCancelledBookings);
      default:
        return [];
    }
  };

  const filteredBookings = getFilteredBookings();
  
  const allCount = getAllBookings.length;
  const upcomingCount = getUpcomingBookings.length;
  const completedCount = getCompletedBookings.length;
  const cancelledCount = getCancelledBookings.length;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      return [new Date().getFullYear()];
    }

    const uniqueYears = [
      ...new Set(
        bookings.map((booking) =>
          new Date(booking.serviceDate).getFullYear()
        )
      ),
    ];

    return uniqueYears.sort((a, b) => b - a);
  }, [bookings]);

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setIsFilterApplied(true);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setIsFilterApplied(true);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
    setIsFilterApplied(true);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
    setIsFilterApplied(true);
  };

  const handleClearFilter = () => {
    setIsFilterApplied(false);
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
  };

  const renderContent = () => {
    // Loading state with skeleton
    if (loading) {
      return <BookingHistoryCardSkeleton />;
    }

    // Error state using reusable ErrorState component
    if (error) {
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

    // Empty state - No bookings at all
    if (bookings.length === 0) {
      return (
        <EmptyState
          title="No Bookings Found"
          message="You haven't made any bookings yet. Browse our services and book your first appointment!"
          icon="Calendar"
          showAction={true}
          actionText="Browse Services"
          onAction={handleBrowseServices}
        />
      );
    }

    // Filter applied but no results
    if (filteredBookings.length === 0 && isFilterApplied) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Bookings Found</h3>
          <p className="text-gray-500">
            No {activeTab === 'all' ? '' : activeTab} bookings found for {months[selectedMonth]} {selectedYear}
          </p>
          <button
            onClick={handleClearFilter}
            className="cursor-pointer mt-4 px-4 py-2 bg-[#336699] text-white rounded-md hover:bg-[#2A5480] transition"
          >
            Clear Filter
          </button>
        </div>
      );
    }

    // Tab has no bookings
    if (filteredBookings.length === 0 && !isFilterApplied) {
      return (
        <EmptyState
          title={`No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings`}
          message={`You don't have any ${activeTab} bookings yet.`}
          icon="Calendar"
          showAction={activeTab === 'all' || activeTab === 'upcoming'}
          actionText={activeTab === 'all' ? "Browse Services" : "Book a Service"}
          onAction={activeTab === 'all' ? handleBrowseServices : handleBookService}
        />
      );
    }

    // Main content - bookings list
    return (
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <BookingHistoryCard key={booking._id} booking={booking} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-20 smooth-scroll">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="mt-2 text-gray-600">View and manage all your service bookings</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
            >
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700 font-medium ">
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </span>
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 mb-6 border border-gray-200">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
                <button
                  onClick={handlePreviousMonth}
                  className="cursor-pointer p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
                </button>

                <div className="relative flex-1 min-w-[80px] max-w-[140px] sm:max-w-[160px]">
                  <button
                    onClick={() => {
                      setMonthOpen(!monthOpen);
                      setYearOpen(false);
                    }}
                    className="cursor-pointer w-full px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium flex items-center justify-between text-[11px] sm:text-xs md:text-sm"
                  >
                    <span className="truncate">{months[selectedMonth]}</span>
                    <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition duration-200 flex-shrink-0 ml-1 ${monthOpen ? "rotate-180" : ""}`} />
                  </button>
                  {monthOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#663399]/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <div className="py-1">
                        {months.map((month, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleMonthChange({ target: { value: index } });
                              setMonthOpen(false);
                            }}
                            className={`cursor-pointer w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm transition-all duration-150 ${
                              selectedMonth === index
                                ? "bg-[#663399]/10 text-[#663399] font-medium"
                                : "text-gray-600 hover:bg-[#663399]/10 hover:text-[#663399]"
                            }`}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative flex-1 min-w-[60px] max-w-[90px] sm:max-w-[120px]">
                  <button
                    onClick={() => {
                      setYearOpen(!yearOpen);
                      setMonthOpen(false);
                    }}
                    className="cursor-pointer w-full px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium flex items-center justify-between text-[11px] sm:text-xs md:text-sm"
                  >
                    <span>{selectedYear}</span>
                    <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 transition duration-200 flex-shrink-0 ml-1 ${yearOpen ? "rotate-180" : ""}`} />
                  </button>
                  {yearOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#663399]/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                      <div className="py-1">
                        {years.map((year) => (
                          <button
                            key={year}
                            onClick={() => {
                              handleYearChange({ target: { value: year } });
                              setYearOpen(false);
                            }}
                            className={`cursor-pointer w-full px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm transition-all duration-150 ${
                              selectedYear === year
                                ? "bg-[#663399]/10 text-[#663399] font-medium"
                                : "text-gray-600 hover:bg-[#663399]/10 hover:text-[#663399]"
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleNextMonth}
                  className="cursor-pointer p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs md:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg font-medium">
                  <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1 sm:mb-1.5 md:mb-2" /> 
                  {months[selectedMonth]} {selectedYear}
                </div>
                {isFilterApplied && (
                  <button
                    onClick={handleClearFilter}
                    className="cursor-pointer text-[11px] sm:text-xs md:text-sm text-red-600 hover:text-red-700 font-medium px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-1"
                  >
                    <span>✕</span>
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>
            </div>
          )}
           
          {isFilterApplied && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-700">
                🔍 Showing bookings for <strong>{months[selectedMonth]} {selectedYear}</strong> | 
                <button
                  onClick={handleClearFilter}
                  className="cursor-pointer ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Show all bookings
                </button>
              </p>
            </div>
          )}

          {!showFilters && !isFilterApplied && bookings.length > 0 && (
            <div className="bg-linear-to-r from-[#E6F0FA] to-[#F0F6FD] rounded-lg p-4 mb-6 border border-[#B8D1E8]">
              <p className="text-sm text-gray-700">
                Showing <span className="font-semibold text-[#663399]">{filteredBookings.length}</span> {activeTab} bookings
              </p>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-[#336699] text-[#336699]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Bookings
              {allCount > 0 && (
                <span className="ml-2 bg-[#336699] text-white px-2 py-0.5 rounded-full text-xs">
                  {allCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'border-[#336699] text-[#336699]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
              {upcomingCount > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  {upcomingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'border-[#336699] text-[#336699]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
              {completedCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {completedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm transition whitespace-nowrap ${
                activeTab === 'cancelled'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
              {cancelledCount > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {cancelledCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default BookingHistoryPage;
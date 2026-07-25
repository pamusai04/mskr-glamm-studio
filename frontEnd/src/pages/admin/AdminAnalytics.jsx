import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Star,
  Clock, RefreshCw, Eye, Briefcase,
  ArrowLeft, BarChart3, X, Zap, Target, CreditCard, ChevronUp, ChevronDown,
  IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import { fetchAllBookings } from '../../redux/slices/adminBookingSlice';
import { fetchAllServices } from '../../redux/slices/adminServiceSlice';
import { fetchAllUsers } from '../../redux/slices/adminUsersSlice';
import { fetchAllReviews } from '../../redux/slices/adminReviewSlice';
import { fetchMeta } from '../../redux/slices/metaSlice';
import AdminLoading from '../../common/AdminLoading';
import EmptyState from '../../common/EmptyState';
import ErrorState from '../../common/ErrorState';
import toast from 'react-hot-toast';
import {
  AnimatedStatsCard,
  SmoothProgressBar,
  AnimatedTopItemsList,
  ChartCard,
  DateRangeDropdown,
  ViewToggle,
  WeeklyActivityChart,
  RevenueProgressBar
} from '../../components/admin/analytics';
import { calculateAnalytics } from '../../utils/analyticsUtils';

const AdminAnalyticsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('month');
  const [chartView, setChartView] = useState('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBookingsTable, setShowBookingsTable] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    topServices: true,
    topCustomers: true,
    peakHours: true,
    revenueByService: true,
  });
  
  const { bookings, loading: bookingsLoading, error: bookingsError } = useSelector(state => state.adminBookings);
  const { reviews } = useSelector(state => state.adminReviews);
  const loading = bookingsLoading;
  const error = bookingsError;

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchAllBookings()),
          dispatch(fetchAllServices()),
          dispatch(fetchAllUsers()),
          dispatch(fetchAllReviews()),
          dispatch(fetchMeta())
        ]);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsInitialLoad(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const analytics = useMemo(() => {
    if (isInitialLoad || bookingsLoading) {
      return null;
    }
    return calculateAnalytics(bookings, reviews, dateRange);
  }, [bookings, reviews, dateRange, isInitialLoad, bookingsLoading]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const toastId = toast.loading('Refreshing analytics data...');
    try {
      await Promise.all([
        dispatch(fetchAllBookings()).unwrap(),
        dispatch(fetchAllServices()).unwrap(),
        dispatch(fetchAllUsers()).unwrap(),
        dispatch(fetchAllReviews()).unwrap(),
        dispatch(fetchMeta()).unwrap()
      ]);
      toast.success('Analytics data refreshed successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to refresh analytics data', { id: toastId });
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const peakHoursItems = useMemo(() => {
    if (analytics && analytics.peakHours && Array.isArray(analytics.peakHours) && analytics.peakHours.length > 0) {
      return analytics.peakHours.map(item => ({
        name: item.name,
        value: item.displayValue
      }));
    }
    return [];
  }, [analytics]);

  const topServicesItems = useMemo(() => {
    if (analytics && analytics.topServices && Array.isArray(analytics.topServices) && analytics.topServices.length > 0) {
      return analytics.topServices.map(s => ({ name: s.name, value: `${s.value} bookings` }));
    }
    return [];
  }, [analytics]);

  const topCustomersItems = useMemo(() => {
    if (analytics && analytics.topCustomers && Array.isArray(analytics.topCustomers) && analytics.topCustomers.length > 0) {
      return analytics.topCustomers.map(c => ({ name: c.name, value: `₹${c.totalSpent.toLocaleString()}` }));
    }
    return [];
  }, [analytics]);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    return chartView === 'monthly' ? analytics.monthlyData : analytics.yearlyData;
  }, [analytics, chartView]);

  const chartLabelKey = chartView === 'monthly' ? 'month' : 'year';
  const maxRevenue = chartData.length > 0 ? Math.max(...chartData.map(d => d.revenue), 1) : 1;

  // Loading state with proper container
  if ((loading || isInitialLoad) && (!bookings || bookings.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <AdminLoading text="Loading analytics data" icon={BarChart3} color="purple" />
        </div>
      </div>
    );
  }

  // Error state with proper container
  if (error && (!bookings || bookings.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ErrorState 
          error={error}
          onRetry={handleRefresh}
          title="Failed to Load Analytics Data"
          icon="alert"
          showRetry={true}
        />
      </div>
    );
  }

  // Processing state
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <AdminLoading text="Processing analytics data..." icon={BarChart3} color="purple" />
        </div>
      </div>
    );
  }

  // Empty state with proper container
  if (!loading && bookings && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <EmptyState
          title="No Analytics Data Available"
          message="There are no bookings yet. Analytics data will appear once bookings are made."
          icon="default"
          showAction={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white sticky top-20 z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <DateRangeDropdown dateRange={dateRange} setDateRange={setDateRange} />
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 py-6 mx-auto">
        {analytics.totalBookings > 0 && (
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 animate-fade-in-up">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Insights</h3>
                <p className="text-sm text-gray-600">
                  You have <span className="font-bold text-gray-900">{analytics.totalBookings}</span> total bookings with 
                  <span className="font-bold text-gray-900"> {analytics.completionRate.toFixed(0)}%</span> completion rate. 
                  {analytics.topServices[0] && (
                    <> <span className="font-bold text-gray-900">{analytics.topServices[0].name}</span> is your most popular service with 
                    <span className="font-bold text-gray-900"> {analytics.topServices[0].value}</span> bookings.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <AnimatedStatsCard
            title="Total Revenue"
            value={`₹${analytics.totalRevenue.toLocaleString()}`}
            subValue={`Avg: ₹${Math.round(analytics.avgRevenue).toLocaleString()}`}
            icon={IndianRupee}
            trend={analytics.revenueTrend > 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(analytics.revenueTrend).toFixed(1)}%`}
            delay={0}
          />
          <AnimatedStatsCard
            title="Total Bookings"
            value={analytics.totalBookings}
            subValue={`${analytics.statusDistribution.completed} completed`}
            icon={Calendar}
            trend={analytics.bookingTrend > 0 ? 'up' : 'down'}
            trendValue={`${Math.abs(analytics.bookingTrend).toFixed(1)}%`}
            delay={100}
          />
          <AnimatedStatsCard
            title="Completion Rate"
            value={`${analytics.completionRate.toFixed(1)}%`}
            subValue={`${analytics.cancellationRate.toFixed(1)}% cancelled`}
            icon={Target}
            delay={200}
          />
          <AnimatedStatsCard
            title="Customer Rating"
            value={analytics.averageRating.toFixed(1)}
            subValue={`from ${reviews?.length || 0} reviews`}
            icon={Star}
            delay={300}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Weekly Activity" delay={400}>
            <div className="overflow-x-auto pb-2">
              <WeeklyActivityChart dailyData={analytics.dailyData} />
            </div>
          </ChartCard>
          
          <ChartCard title="Booking Status Distribution" delay={500}>
            <div className="space-y-5">
              <SmoothProgressBar 
                label="Completed" 
                value={analytics.statusDistribution.completed} 
                total={analytics.totalBookings}
                color="green"
                delay={0}
              />
              <SmoothProgressBar 
                label="Confirmed" 
                value={analytics.statusDistribution.confirmed} 
                total={analytics.totalBookings}
                color="blue"
                delay={100}
              />
              <SmoothProgressBar 
                label="Pending" 
                value={analytics.statusDistribution.pending} 
                total={analytics.totalBookings}
                color="yellow"
                delay={200}
              />
              <SmoothProgressBar 
                label="Cancelled" 
                value={analytics.statusDistribution.cancelled} 
                total={analytics.totalBookings}
                color="red"
                delay={300}
              />
            </div>
          </ChartCard>
        </div>
        
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <ViewToggle view={chartView} setView={setChartView} />
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px]">
                <div className="flex justify-around items-end h-72 gap-2 sm:gap-4">
                  {chartData.map((item, idx) => {
                    const height = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={idx} className="text-center flex-1 min-w-0">
                        <div className="relative h-56 flex items-end justify-center">
                          <div 
                            className="absolute bottom-0 w-full max-w-[50px] sm:max-w-[70px] bg-gradient-to-t from-gray-600 to-gray-700 rounded-t-lg transition-all duration-500 hover:from-gray-700 hover:to-gray-800 cursor-pointer group"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-900 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-1 rounded shadow-md z-10">
                              ₹{item.revenue.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-600 mt-3 truncate">{item[chartLabelKey]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <AnimatedTopItemsList
            title="Top Services"
            items={topServicesItems}
            icon={Briefcase}
            delay={700}
          />
          <AnimatedTopItemsList
            title="Top Customers by Spend"
            items={topCustomersItems}
            icon={Users}
            delay={800}
          />
          <AnimatedTopItemsList
            title="Peak Hours"
            items={peakHoursItems}
            icon={Clock}
            delay={900}
          />
        </div>
        
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Revenue by Service</h3>
              </div>
              <button
                onClick={() => toggleSection('revenueByService')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {expandedSections.revenueByService ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            
            {expandedSections.revenueByService && (
              <div className="space-y-5 animate-fade-in-up">
                {analytics.revenueByService && analytics.revenueByService.length > 0 ? (
                  analytics.revenueByService.map((service, idx) => {
                    const maxRev = analytics.revenueByService[0]?.revenue || 1;
                    const percentage = (service.revenue / maxRev) * 100;
                    return (
                      <RevenueProgressBar 
                        key={idx}
                        name={service.name} 
                        revenue={service.revenue} 
                        percentage={percentage} 
                      />
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500 py-4">No revenue data available</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {showBookingsTable && analytics.filteredBookings.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-gray-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                </div>
                <button
                  onClick={() => setShowBookingsTable(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-gray-200">
                    <tr className="text-left">
                      <th className="pb-3 text-sm font-semibold text-gray-600">Customer</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Date</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Services</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Amount</th>
                      <th className="pb-3 text-sm font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.filteredBookings.slice(0, 10).map((booking, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3">
                          <div className="font-medium text-gray-900">{booking.fullName}</div>
                          <div className="text-xs text-gray-500">{booking.emailId}</div>
                        </td>
                        <td className="py-3 text-gray-600">
                          {format(new Date(booking.serviceDate), 'dd MMM yyyy')}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {booking.serviceItemIds?.slice(0, 2).map((service, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-700">
                                {service.name}
                              </span>
                            ))}
                            {booking.serviceItemIds?.length > 2 && (
                              <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-500">
                                +{booking.serviceItemIds.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 font-bold text-gray-900">₹{booking.totalAmount?.toLocaleString() || 0}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {!showBookingsTable && analytics.filteredBookings.length > 0 && (
          <div className="text-center mb-8 animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
            <button
              onClick={() => setShowBookingsTable(true)}
              className="px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center gap-2 mx-auto font-medium shadow-sm hover:shadow-md"
            >
              <Eye className="w-4 h-4" />
              View Recent Bookings
            </button>
          </div>
        )}
        
        <div className="p-6 rounded-xl bg-gray-100 border border-gray-200 animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">Dashboard Summary</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-xl font-bold text-gray-900 mt-1">₹{analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{analytics.totalBookings}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completion Rate</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{analytics.completionRate.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Retention Rate</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{analytics.customerRetention.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
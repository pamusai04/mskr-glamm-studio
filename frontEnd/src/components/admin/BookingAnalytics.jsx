import React, { memo, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Calendar, DollarSign, Users, PieChart } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const BookingAnalytics = memo(({ bookings, onClose }) => {
  const analytics = useMemo(() => {
    if (!bookings || bookings.length === 0) return null;
    
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    const weeklyBookings = bookings.filter(b => {
      const date = new Date(b.serviceDate);
      return date >= weekStart && date <= weekEnd;
    });
    
    const monthlyBookings = bookings.filter(b => {
      const date = new Date(b.serviceDate);
      return date >= monthStart && date <= monthEnd;
    });
    
    const dailyData = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(day => {
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.serviceDate);
        return bookingDate.toDateString() === day.toDateString();
      });
      return {
        date: day,
        count: dayBookings.length,
        revenue: dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      };
    });
    
    const statusDistribution = {
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    
    const topServices = {};
    bookings.forEach(booking => {
      booking.serviceItemIds?.forEach(service => {
        topServices[service.name] = (topServices[service.name] || 0) + (service.quantity || 1);
      });
    });
    
    const topServicesList = Object.entries(topServices)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const peakHours = {};
    bookings.forEach(booking => {
      const slot = booking.preferredSlot;
      peakHours[slot] = (peakHours[slot] || 0) + 1;
    });
    
    return {
      weeklyBookings,
      monthlyBookings,
      dailyData,
      statusDistribution,
      topServicesList,
      peakHours,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      avgRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / bookings.length
    };
  }, [bookings]);
  
  if (!analytics) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Booking Analytics</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-600">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-900">
                ₹{analytics.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-purple-500 mt-1">
                Avg: ₹{Math.round(analytics.avgRevenue).toLocaleString()}
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-blue-600">Total Bookings</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {bookings.length}
              </div>
              <div className="text-xs text-blue-500 mt-1">
                This week: {analytics.weeklyBookings.length}
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-600">Completion Rate</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-900">
                {((analytics.statusDistribution.completed / bookings.length) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-green-500 mt-1">
                {analytics.statusDistribution.completed} completed
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-yellow-600">Pending</span>
                <Users className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {analytics.statusDistribution.pending}
              </div>
              <div className="text-xs text-yellow-500 mt-1">
                Awaiting confirmation
              </div>
            </div>
          </div>
          
          {/* Daily Activity */}
          <div className="mb-8">
            <h3 className="font-medium text-gray-900 mb-4">Weekly Activity</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2">
                {analytics.dailyData.map((day, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {format(day.date, 'EEE')}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {day.count}
                    </div>
                    <div className="text-xs text-purple-600">
                      ₹{day.revenue.toLocaleString()}
                    </div>
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(day.count / Math.max(...analytics.dailyData.map(d => d.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Status Distribution</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                    const percentage = (count / bookings.length) * 100;
                    let colorClass = '';
                    switch(status) {
                      case 'pending': colorClass = 'bg-yellow-500'; break;
                      case 'confirmed': colorClass = 'bg-blue-500'; break;
                      case 'completed': colorClass = 'bg-green-500'; break;
                      case 'cancelled': colorClass = 'bg-red-500'; break;
                      default: colorClass = 'bg-gray-500';
                    }
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize text-gray-600">{status}</span>
                          <span className="font-medium text-gray-900">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Top Services */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Top Services</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {analytics.topServicesList.map(([service, count]) => (
                    <div key={service}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{service}</span>
                        <span className="font-medium text-gray-900">{count} bookings</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${(count / analytics.topServicesList[0][1]) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Peak Hours */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-4">Popular Time Slots</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.peakHours)
                  .sort((a, b) => b[1] - a[1])
                  .map(([slot, count]) => (
                    <div key={slot} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{slot}</span>
                      <span className="text-sm font-medium text-purple-600">{count} bookings</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BookingAnalytics.displayName = 'BookingAnalytics';

export default BookingAnalytics;
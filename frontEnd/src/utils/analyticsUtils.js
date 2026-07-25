

import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subDays, subMonths, startOfYear, endOfYear, format } from 'date-fns';

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours);
  minutes = parseInt(minutes || 0);
  
  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${ampm}`;
};

const getTimeBlocks = (startTime, endTime, blockSize = 30) => {
  const blocks = [];
  let start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  
  if (start >= end) return blocks;
  
  start = Math.ceil(start / blockSize) * blockSize;
  
  for (let time = start; time < end; time += blockSize) {
    blocks.push(time);
  }
  
  return blocks;
};

// Group consecutive time blocks into ranges
const groupTimeBlocksIntoRanges = (blocksWithCounts) => {
  if (!blocksWithCounts.length) return [];
  
  const ranges = [];
  let currentRange = {
    start: blocksWithCounts[0].time,
    end: blocksWithCounts[0].time + 30,
    count: blocksWithCounts[0].count
  };
  
  for (let i = 1; i < blocksWithCounts.length; i++) {
    const current = blocksWithCounts[i];
    const prevEnd = currentRange.end;
    
    // If this block is consecutive (starts exactly when previous ends) and has same count
    if (current.time === prevEnd && current.count === currentRange.count) {
      currentRange.end = current.time + 30;
    } else {
      ranges.push({
        startTime: minutesToTime(currentRange.start),
        endTime: minutesToTime(currentRange.end),
        count: currentRange.count,
        display: `${minutesToTime(currentRange.start)} - ${minutesToTime(currentRange.end)}`
      });
      currentRange = {
        start: current.time,
        end: current.time + 30,
        count: current.count
      };
    }
  }
  
  ranges.push({
    startTime: minutesToTime(currentRange.start),
    endTime: minutesToTime(currentRange.end),
    count: currentRange.count,
    display: `${minutesToTime(currentRange.start)} - ${minutesToTime(currentRange.end)}`
  });
  
  return ranges;
};

export const filterBookingsByDate = (bookingsData, range) => {
  if (!bookingsData || bookingsData.length === 0) return [];
  if (range === 'all') return bookingsData;
  
  const now = new Date();
  let startDate;
  
  switch(range) {
    case 'week':
      startDate = startOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'quarter':
      startDate = subMonths(now, 3);
      break;
    case 'year':
      startDate = startOfYear(now);
      break;
    default:
      return bookingsData;
  }
  
  return bookingsData.filter(booking => new Date(booking.bookedDate || booking.serviceDate) >= startDate);
};

export const calculateAnalytics = (bookingsData, reviewsData, range) => {
  if (!bookingsData || bookingsData.length === 0) {
    return {
      filteredBookings: [],
      totalRevenue: 0,
      avgRevenue: 0,
      totalBookings: 0,
      completionRate: 0,
      cancellationRate: 0,
      statusDistribution: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
      dailyData: [],
      monthlyData: [],
      yearlyData: [],
      topServices: [],
      topCustomers: [],
      revenueByService: [],
      peakHours: [],
      averageRating: 0,
      customerRetention: 0,
      revenueTrend: 0,
      bookingTrend: 0
    };
  }
  
  const filteredBookings = filterBookingsByDate(bookingsData, range);
  const totalRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalBookings = filteredBookings.length;
  
  const statusDistribution = {
    pending: filteredBookings.filter(b => b.status === 'pending').length,
    confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
    completed: filteredBookings.filter(b => b.status === 'completed').length,
    cancelled: filteredBookings.filter(b => b.status === 'cancelled').length
  };
  
  const completionRate = totalBookings > 0 ? (statusDistribution.completed / totalBookings) * 100 : 0;
  const cancellationRate = totalBookings > 0 ? (statusDistribution.cancelled / totalBookings) * 100 : 0;
  
  const now = new Date();
  
  // Weekly data
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const dailyData = [];
  for (let date = new Date(weekStart); date <= weekEnd; date.setDate(date.getDate() + 1)) {
    const dayBookings = filteredBookings.filter(b => {
      const bookingDate = new Date(b.serviceDate || b.bookedDate);
      return bookingDate.toDateString() === date.toDateString();
    });
    dailyData.push({
      date: new Date(date),
      count: dayBookings.length,
      revenue: dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    });
  }
  
  // Monthly data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    const monthBookings = filteredBookings.filter(b => {
      const date = new Date(b.bookedDate || b.serviceDate);
      return date >= monthStart && date <= monthEnd;
    });
    monthlyData.push({
      month: format(monthStart, 'MMM yyyy'),
      count: monthBookings.length,
      revenue: monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    });
  }
  
  // Yearly data
  const yearlyData = [];
  for (let i = 3; i >= 0; i--) {
    const yearStart = startOfYear(subYears(now, i));
    const yearEnd = endOfYear(subYears(now, i));
    const yearBookings = filteredBookings.filter(b => {
      const date = new Date(b.bookedDate || b.serviceDate);
      return date >= yearStart && date <= yearEnd;
    });
    yearlyData.push({
      year: format(yearStart, 'yyyy'),
      count: yearBookings.length,
      revenue: yearBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    });
  }
  
  // Top services
  const serviceCount = {};
  filteredBookings.forEach(booking => {
    booking.serviceItemIds?.forEach(service => {
      const serviceName = service.name;
      serviceCount[serviceName] = {
        count: (serviceCount[serviceName]?.count || 0) + (service.numberOfPersons || 1),
        revenue: (serviceCount[serviceName]?.revenue || 0) + (service.price || 0)
      };
    });
  });
  
  const topServices = Object.entries(serviceCount)
    .map(([name, data]) => ({ name, value: data.count, revenue: data.revenue }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  
  const revenueByService = Object.entries(serviceCount)
    .map(([name, data]) => ({ name, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
  
  // Top customers
  const customerBookings = {};
  filteredBookings.forEach(booking => {
    const customerName = booking.fullName;
    if (!customerBookings[customerName]) {
      customerBookings[customerName] = {
        name: customerName,
        bookings: 0,
        totalSpent: 0,
        email: booking.emailId
      };
    }
    customerBookings[customerName].bookings++;
    customerBookings[customerName].totalSpent += booking.totalAmount || 0;
  });
  
  const topCustomers = Object.values(customerBookings)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);
  
  // Peak hours - using time blocks grouped into ranges
  const peakHourBlocks = {};
  filteredBookings.forEach(booking => {
    if (booking.preferredSlot) {
      let startTime = '';
      let endTime = '';
      
      if (typeof booking.preferredSlot === 'object') {
        startTime = booking.preferredSlot.startTime;
        endTime = booking.preferredSlot.endTime;
      } else if (typeof booking.preferredSlot === 'string') {
        const parts = booking.preferredSlot.split(' - ');
        if (parts.length === 2) {
          startTime = parts[0];
          endTime = parts[1];
        }
      }
      
      if (startTime && endTime) {
        const blocks = getTimeBlocks(startTime, endTime, 30);
        blocks.forEach(block => {
          peakHourBlocks[block] = (peakHourBlocks[block] || 0) + 1;
        });
      }
    }
  });
  
  // Convert to array and sort by count (highest first)
  const sortedBlocks = Object.entries(peakHourBlocks)
    .map(([time, count]) => ({ time: parseInt(time), count }))
    .sort((a, b) => b.count - a.count);
  
  // Take top blocks (minimum 15, but we'll group them)
  const topBlocks = sortedBlocks.slice(0, 20);
  
  // Group consecutive blocks with same count into ranges
  const groupedPeakHours = groupTimeBlocksIntoRanges(topBlocks);
  
  // Sort by count and take top 5
  const peakHours = groupedPeakHours
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(range => ({
      name: range.display,
      displayValue: `${range.count} booking${range.count !== 1 ? 's' : ''}`
    }));
  
  const averageRating = reviewsData && reviewsData.length > 0
    ? reviewsData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsData.length
    : 0;
  
  const returningCustomers = Object.values(customerBookings).filter(c => c.bookings > 1).length;
  const customerRetention = totalBookings > 0 ? (returningCustomers / totalBookings) * 100 : 0;
  
  // Previous period for trends
  let previousPeriodStart, previousPeriodEnd;
  if (range === 'week') {
    previousPeriodStart = subDays(now, 14);
    previousPeriodEnd = subDays(now, 7);
  } else if (range === 'month') {
    previousPeriodStart = subMonths(now, 2);
    previousPeriodEnd = subMonths(now, 1);
  } else if (range === 'quarter') {
    previousPeriodStart = subMonths(now, 6);
    previousPeriodEnd = subMonths(now, 3);
  } else if (range === 'year') {
    previousPeriodStart = subYears(now, 2);
    previousPeriodEnd = subYears(now, 1);
  } else {
    previousPeriodStart = new Date(0);
    previousPeriodEnd = new Date(0);
  }
  
  const previousPeriodBookings = range !== 'all' ? bookingsData.filter(booking => {
    const date = new Date(booking.bookedDate || booking.serviceDate);
    return date >= previousPeriodStart && date <= previousPeriodEnd;
  }) : [];
  
  const previousRevenue = previousPeriodBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const revenueTrend = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  
  const previousBookings = previousPeriodBookings.length;
  const bookingTrend = previousBookings > 0 ? ((totalBookings - previousBookings) / previousBookings) * 100 : 0;
  
  return {
    filteredBookings,
    totalRevenue,
    avgRevenue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
    totalBookings,
    completionRate,
    cancellationRate,
    statusDistribution,
    dailyData,
    monthlyData,
    yearlyData,
    topServices,
    topCustomers,
    revenueByService,
    peakHours,
    averageRating,
    customerRetention,
    revenueTrend,
    bookingTrend
  };
};

// Helper function
function subYears(date, years) {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() - years);
  return result;
}
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

export const fetchAllBookings = createAsyncThunk(
  'adminBookings/fetchAllBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/getHistory');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'adminBookings/updateBookingStatus',
  async ({ bookingId, status, reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/admin/update-booking-status', {
        bookingId,
        status,
        reason
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  success: false,
  message: null,
  updatingStatus: false,
  updateError: null
};


const adminBookingsSlice = createSlice({
  name: 'adminBookings',
  initialState,
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
      state.updateError = null;
    },
    clearBookingSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetBookings: (state) => {
      state.bookings = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.updatingStatus = false;
      state.updateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(fetchAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateBookingStatus.pending, (state) => {
        state.updatingStatus = true;
        state.updateError = null;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        state.updatingStatus = false;
        const updatedBooking = action.payload.data;
        const index = state.bookings.findIndex(booking => booking.booking_id === updatedBooking.bookingId);
        if (index !== -1) {
          state.bookings[index] = {
            ...state.bookings[index],
            status: updatedBooking.status,
            cancellationReason: updatedBooking.cancellationReason || state.bookings[index].cancellationReason
          };
        }
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(updateBookingStatus.rejected, (state, action) => {
        state.updatingStatus = false;
        state.updateError = action.payload;
        state.success = false;
      });
  }
});

export const { clearBookingError, clearBookingSuccess, resetBookings } = adminBookingsSlice.actions;
export default adminBookingsSlice.reducer;
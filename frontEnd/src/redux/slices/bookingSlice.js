import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  
  async (bookingData, { rejectWithValue }) => {
    try {
      
      const token = localStorage.getItem('token');
      
      const response = await axiosInstance.post("/user/book-service", bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const getBookingHistory = createAsyncThunk(
  "booking/getBookingHistory",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get("/user/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data; // Extract the data array from response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getSlotAvailability = createAsyncThunk(
  "booking/getSlotAvailability",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get("/user/slot-availability", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  slotAvailability: null,
  loading: false,
  error: null,
  success: false,
  bookingLoaded: false,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearSlotAvailability: (state) => {
      state.slotAvailability = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBookingState: (state) => {
      state.bookings = [];
      state.currentBooking = null;
      state.slotAvailability = null;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.bookingLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentBooking = action.payload;
        state.bookingLoaded = true;
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.bookingLoaded = false;
      })
      
      
      .addCase(getBookingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload || [];
        state.bookingLoaded = true;
      })
      .addCase(getBookingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.bookings = [];
      })
      
      
      .addCase(getSlotAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSlotAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.slotAvailability = action.payload;
        state.bookingLoaded = true;
      })
      .addCase(getSlotAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.slotAvailability = null;
      });
  },
});

export const {
  clearBookingState,
  clearCurrentBooking,
  clearSlotAvailability,
  clearError,
  resetBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
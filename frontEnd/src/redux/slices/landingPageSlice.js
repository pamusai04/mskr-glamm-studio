import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchLandingPageData = createAsyncThunk(
  "landingPage/fetchLandingPageData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/public/landing-data");
      return response?.data?.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const landingPageSlice = createSlice({
  name: "landingPage",
  initialState: {
    services: [],
    statistics: {
      totalClients: 0,
      totalBookings: 0,
      totalServices: 0
    },
    heroImages: {},
    qrCode: null,
    isLoading: false,
    error: null,
    hasLoaded: false
  },
  reducers: {
    clearLandingPageError: (state) => {
      state.error = null;
    },
    resetLandingPage: (state) => {
      state.services = [];
      state.statistics = {
        totalClients: 0,
        totalBookings: 0,
        totalServices: 0
      };
      state.heroImages = {};
      state.qrCode = null;
      state.isLoading = false;
      state.error = null;
      state.hasLoaded = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLandingPageData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLandingPageData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.services = action.payload.services || [];
          state.statistics = {
            totalClients: action.payload.statistics?.clients || 0,
            totalBookings: action.payload.statistics?.bookings || 0,
            totalServices: action.payload.statistics?.services || 0
          };
          state.heroImages = action.payload.heroImages || {};
          state.qrCode = action.payload.qrCode || null;
          state.hasLoaded = true;
        }
      })
      .addCase(fetchLandingPageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLandingPageError, resetLandingPage } = landingPageSlice.actions;
export default landingPageSlice.reducer;
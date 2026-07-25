import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchUserOffers = createAsyncThunk(
  "userOffers/fetchUserOffers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      const token = user.user?.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.get("/user/offers", config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const userOfferSlice = createSlice({
  name: "userOffers",
  initialState: {
    offers: [],
    loading: false,
    error: null,
    success: false,
    offersLoaded: false,
  },
  reducers: {
    clearUserOfferError: (state) => {
      state.error = null;
    },
    clearUserOfferSuccess: (state) => {
      state.success = false;
    },
    resetUserOffersLoaded: (state) => {
      state.offersLoaded = false;
    },
    clearUserOffers: (state) => {
      state.offers = [];
      state.offersLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.offersLoaded = false;
      })
      .addCase(fetchUserOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.data || [];
        state.success = true;
        state.offersLoaded = true;
      })
      .addCase(fetchUserOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.offersLoaded = false;
        state.success = false;
      });
  },
});

export const { 
  clearUserOfferError, 
  clearUserOfferSuccess, 
  resetUserOffersLoaded,
  clearUserOffers 
} = userOfferSlice.actions;

export default userOfferSlice.reducer;
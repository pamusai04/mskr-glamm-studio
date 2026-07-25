
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchOffers = createAsyncThunk(
  "offers/fetchOffers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      const token = user.user?.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axiosInstance.get("/offer/offers", config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createOffer = createAsyncThunk(
  "offers/createOffer",
  async (offerData, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      const token = user.user?.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axiosInstance.post("/offer/offers", offerData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteOffer = createAsyncThunk(
  "offers/deleteOffer",
  async (offerId, { rejectWithValue, getState }) => {
    try {
      const { user } = getState();
      const token = user.user?.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axiosInstance.delete("/offer/offers", {
        data: { _id: offerId },
        ...config,
      });
      return { ...response.data, offerId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const offerSlice = createSlice({
  name: "offers",
  initialState: {
    offers: [],
    loading: false,
    error: null,
    success: false,
    offersLoaded: false, 
  },
  reducers: {
    clearOfferError: (state) => {
      state.error = null;
    },
    clearOfferSuccess: (state) => {
      state.success = false;
    },
    resetOffersLoaded: (state) => {
      state.offersLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.offersLoaded = false;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = action.payload.data || [];
        state.success = true;
        state.offersLoaded = true; // Set to true when fetched
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.offersLoaded = false;
      })
      .addCase(createOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers.push(action.payload.data);
        state.success = true;
      })
      .addCase(createOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteOffer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOffer.fulfilled, (state, action) => {
        state.loading = false;
        state.offers = state.offers.filter(
          (offer) => offer._id !== action.payload.offerId
        );
        state.success = true;
      })
      .addCase(deleteOffer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOfferError, clearOfferSuccess, resetOffersLoaded } = offerSlice.actions;
export default offerSlice.reducer;
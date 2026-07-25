import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchServiceMeta = createAsyncThunk(
  "serviceMeta/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/getMeta");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const serviceMetaSlice = createSlice({
  name: "serviceMeta",
  initialState: {
    serviceMeta: null,
    eventPhotos: [],
    usersCount: 0,
    bookingsCount: 0,
    servicesCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetServiceMeta: (state) => {
      state.serviceMeta = null;
      state.eventPhotos = [];
      state.usersCount = 0;
      state.bookingsCount = 0;
      state.servicesCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Service Meta
      .addCase(fetchServiceMeta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceMeta.fulfilled, (state, action) => {
        state.loading = false;
        state.serviceMeta = action.payload.data?.serviceMeta?.[0] || null;
        state.eventPhotos = action.payload.data?.eventPhotos || [];
        state.usersCount = action.payload.data?.usersCount || 0;
        state.bookingsCount = action.payload.data?.bookingsCount || 0;
        state.servicesCount = action.payload.data?.servicesCount || 0;
      })
      .addCase(fetchServiceMeta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || "Failed to fetch service meta";
      });
  },
});

export const { clearError, resetServiceMeta } = serviceMetaSlice.actions;
export default serviceMetaSlice.reducer;
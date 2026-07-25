import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchEventPhotos = createAsyncThunk(
  "eventPhotos/fetchEventPhotos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/get-event-photos");
      return response?.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addEventPhoto = createAsyncThunk(
  "eventPhotos/addEventPhoto",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/add-event-photo", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response?.data?.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteEventPhoto = createAsyncThunk(
  "eventPhotos/deleteEventPhoto",
  async (photoId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/admin/delete-event-photo", { data: { photoId } });
      return photoId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const eventPhotosSlice = createSlice({
  name: "eventPhotos",
  initialState: {
    eventPhotos: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearEventPhotosError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Event Photos
      .addCase(fetchEventPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.eventPhotos = action.payload;
      })
      .addCase(fetchEventPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Event Photo
      .addCase(addEventPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEventPhoto.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.eventPhotos.push(action.payload);
        }
      })
      .addCase(addEventPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Event Photo
      .addCase(deleteEventPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEventPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.eventPhotos = state.eventPhotos.filter(
          photo => photo._id !== action.payload
        );
      })
      .addCase(deleteEventPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEventPhotosError } = eventPhotosSlice.actions;
export default eventPhotosSlice.reducer;
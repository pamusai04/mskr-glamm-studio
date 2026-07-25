import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchHeroImages = createAsyncThunk(
  "heroImages/fetchHeroImages",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/hero-images");
      return response?.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addHeroImage = createAsyncThunk(
  "heroImages/addHeroImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/hero-images", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response?.data?.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateHeroImage = createAsyncThunk(
  "heroImages/updateHeroImage",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      if (data.nameOfTheImage) formData.append('nameOfTheImage', data.nameOfTheImage);
      if (data.image) formData.append('image', data.image);
      
      const response = await axiosInstance.put("/admin/hero-images", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response?.data?.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteHeroImage = createAsyncThunk(
  "heroImages/deleteHeroImage",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete("/admin/hero-images", { data: { id } });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const heroImagesSlice = createSlice({
  name: "heroImages",
  initialState: {
    heroImages: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearHeroImagesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeroImages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeroImages.fulfilled, (state, action) => {
        state.loading = false;
        state.heroImages = action.payload;
      })
      .addCase(fetchHeroImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addHeroImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addHeroImage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.heroImages.push(action.payload);
        }
      })
      .addCase(addHeroImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateHeroImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHeroImage.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.heroImages.findIndex(img => img._id === action.payload._id);
          if (index !== -1) {
            state.heroImages[index] = action.payload;
          }
        }
      })
      .addCase(updateHeroImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteHeroImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHeroImage.fulfilled, (state, action) => {
        state.loading = false;
        state.heroImages = state.heroImages.filter(img => img._id !== action.payload);
      })
      .addCase(deleteHeroImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearHeroImagesError } = heroImagesSlice.actions;
export default heroImagesSlice.reducer;
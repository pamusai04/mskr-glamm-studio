import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axiosInstance';

export const fetchAllServices = createAsyncThunk(
  'adminServices/fetchAllServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/admin/getServices');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addService = createAsyncThunk(
  'adminServices/addService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/admin/addService', serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateService = createAsyncThunk(
  'adminServices/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/admin/updateService', serviceData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  'adminServices/deleteService',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/admin/deleteService', { data: { _id: data._id } });
      return { ...response.data, deletedId: data._id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  services: [],
  loading: false,
  error: null,
  success: false,
  message: null,
};

const adminServiceSlice = createSlice({
  name: 'adminServices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = null;
    },
    resetServices: (state) => {
      state.services = [];
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllServices.fulfilled, (state, action) => {
        state.loading = false;
        state.services = action.payload.data;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(fetchAllServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(addService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.data) {
          state.services.push(action.payload.data);
        }
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(addService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service._id === action.payload.data._id);
        if (index !== -1) {
          state.services[index] = action.payload.data;
        }
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.deletedId;
        state.services = state.services.filter(service => service._id !== deletedId);
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, resetServices } = adminServiceSlice.actions;
export default adminServiceSlice.reducer;
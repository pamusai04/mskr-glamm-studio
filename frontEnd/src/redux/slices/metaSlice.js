import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";
import toast from 'react-hot-toast';

let activeToastId = null;

const showToastMessage = (message, type = 'success', duration = 5000) => {
  if (activeToastId) {
    toast.dismiss(activeToastId);
    activeToastId = null;
  }
  const toastFn = type === 'success' ? toast.success : toast.error;
  activeToastId = toastFn(message, {
    id: Date.now().toString(),
    duration: duration
  });
  setTimeout(() => {
    activeToastId = null;
  }, duration);
};


const handleApiError = (error) => {
  if (error.response?.status === 429) {
    const data = error.response.data;
    return {
      message: data.message || 'Too many requests. Please try again later.',
      retryAfter: data.retryAfter,
      isRateLimit: true
    };
  }
  return {
    message: error.response?.data?.message || error.message || 'Something went wrong',
    isRateLimit: false
  };
};

export const fetchMeta = createAsyncThunk(
  "meta/fetchMeta",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/getMeta");
      return res?.data?.data || null;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const addServiceMeta = createAsyncThunk(
  "meta/addServiceMeta",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/addMeta", formData);
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const deleteServiceMetaItem = createAsyncThunk(
  "meta/deleteItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/admin/deleteMeta", { data: { _id: id } });
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const updateLocation = createAsyncThunk(
  "meta/updateLocation",
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/addMeta", { location: locationData });
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const updateContact = createAsyncThunk(
  "meta/updateContact",
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/addMeta", contactData);
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const addTimeSlot = createAsyncThunk(
  "meta/addTimeSlot",
  async (timeSlotData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/addMeta", { timeSlots: [timeSlotData] });
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const addEventPhoto = createAsyncThunk(
  "meta/addEventPhoto",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/addMeta", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const addShopClosureDate = createAsyncThunk(
  "meta/addShopClosureDate",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/admin/shop-closure", data);
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const deleteShopClosureDate = createAsyncThunk(
  "meta/deleteShopClosureDate",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete("/admin/shop-closure", { data: { id } });
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (err) {
      const handledError = handleApiError(err);
      if (handledError.isRateLimit) {
        showToastMessage(handledError.message, 'error', 5000);
      } else if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

const metaSlice = createSlice({
  name: "meta",
  initialState: {
    meta: null,
    bookingsCount: 0,
    usersCount: 0,
    servicesCount: 0,
    loading: false,
    error: null,
    fetched: false,
    deleteLoading: false,
    addLoading: false,
    updateLoading: false,
    closureLoading: false,
    isRateLimited: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.isRateLimited = false;
    },
    setRateLimited: (state, action) => {
      state.isRateLimited = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeta.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeta.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload;
        if (data) {
          state.meta = data.serviceMeta?.[0] || null;
          state.bookingsCount = data.bookingsCount || 0;
          state.usersCount = data.usersCount || 0;
          state.servicesCount = data.servicesCount || 0;
          state.fetched = true;
        }
        state.isRateLimited = false;
      })
      .addCase(fetchMeta.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(deleteServiceMetaItem.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteServiceMetaItem.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (state.meta && action.payload.data) {
          const updatedData = action.payload.data;
          if (updatedData.timeSlots) {
            state.meta.timeSlots = updatedData.timeSlots;
          }
          if (updatedData.eventPhotos) {
            state.meta.eventPhotos = updatedData.eventPhotos;
          }
        }
        state.isRateLimited = false;
      })
      .addCase(deleteServiceMetaItem.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(addServiceMeta.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addServiceMeta.fulfilled, (state, action) => {
        state.addLoading = false;
        if (action.payload.data) {
          state.meta = action.payload.data;
          state.fetched = true;
        }
        state.isRateLimited = false;
      })
      .addCase(addServiceMeta.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(updateLocation.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.meta && action.payload.data) {
          state.meta.location = action.payload.data.location;
        }
        state.isRateLimited = false;
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(updateContact.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.meta && action.payload.data) {
          state.meta.phoneNumber = action.payload.data.phoneNumber;
          state.meta.gmailId = action.payload.data.gmailId;
        }
        state.isRateLimited = false;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(addTimeSlot.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(addTimeSlot.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.meta && action.payload.data) {
          state.meta.timeSlots = action.payload.data.timeSlots;
        }
        state.isRateLimited = false;
      })
      .addCase(addTimeSlot.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(addEventPhoto.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(addEventPhoto.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.meta && action.payload.data) {
          state.meta.eventPhotos = action.payload.data.eventPhotos;
        }
        state.isRateLimited = false;
      })
      .addCase(addEventPhoto.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(addShopClosureDate.pending, (state) => {
        state.closureLoading = true;
        state.error = null;
      })
      .addCase(addShopClosureDate.fulfilled, (state, action) => {
        state.closureLoading = false;
        if (state.meta && action.payload.data) {
          if (!state.meta.shopClosureDates) {
            state.meta.shopClosureDates = [];
          }
          state.meta.shopClosureDates.push(action.payload.data);
        }
        state.isRateLimited = false;
      })
      .addCase(addShopClosureDate.rejected, (state, action) => {
        state.closureLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      })
      
      .addCase(deleteShopClosureDate.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteShopClosureDate.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (state.meta && action.payload.data && action.payload.data.shopClosureDates) {
          state.meta.shopClosureDates = action.payload.data.shopClosureDates;
        }
        state.isRateLimited = false;
      })
      .addCase(deleteShopClosureDate.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
        if (action.payload?.includes('Too many requests')) {
          state.isRateLimited = true;
        }
      });
  },
});

export const { clearError, setRateLimited } = metaSlice.actions;
export default metaSlice.reducer;
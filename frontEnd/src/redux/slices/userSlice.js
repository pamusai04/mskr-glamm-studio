import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from '../../axiosInstance';
import toast from 'react-hot-toast';

let activeToastId = null;

const showToastMessage = (message, type = 'success') => {
  if (activeToastId) {
    toast.dismiss(activeToastId);
    activeToastId = null;
  }
  const toastFn = type === 'success' ? toast.success : toast.error;
  activeToastId = toastFn(message, {
    id: Date.now().toString(),
    duration: 5000
  });
  setTimeout(() => {
    activeToastId = null;
  }, 5000);
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

export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/check-auth');
      if (response.data.success && response.data.user) {
        return response.data.user;
      }
      return rejectWithValue(null);
    } catch (error) {
      return rejectWithValue(null);
    }
  }
);

export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      if (response.data.success && response.data.user) {
        if (response.data.message) {
          showToastMessage(response.data.message, 'success');
        }
        return response.data.user;
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue(error.message);
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/logout');
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      dispatch({ type: 'RESET_STATE' });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'RESET_STATE' });
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      if (response.data.success) {
        if (response.data.message) {
          showToastMessage(response.data.message, 'success');
        }
        return {
          requiresVerification: true,
          emailId: response.data.emailId,
          message: response.data.message
        };
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue(error);
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'user/verifyOTP',
  async ({ emailId, otpCode }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { emailId, otpCode });
      if (response.data.success && response.data.user) {
        if (response.data.message) {
          showToastMessage(response.data.message, 'success');
        }
        return response.data.user;
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue(error.message);
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const resendOTP = createAsyncThunk(
  'user/resendOTP',
  async ({ emailId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/resend-otp', { emailId });
      if (response.data.success) {
        if (response.data.message) {
          showToastMessage(response.data.message, 'success');
        }
        return { success: true, message: response.data.message, emailId };
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue(error.message);
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async ({ emailId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { emailId });
      if (response.data.success) {
        if (response.data.message) {
          showToastMessage(response.data.message, 'success');
        }
        return { success: true, message: response.data.message };
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue(error.message);
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ emailId, otpCode, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', { emailId, otpCode, newPassword });
      if (response.data.success) {
        if (response.data.message) {
          showToastMessage(response.data.message, 'success');
        }
        return { success: true, message: response.data.message };
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue(error.message);
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user/profile');
      if (response.data.success && response.data.user) {
        return response.data.user;
      }
      const error = handleApiError({ response });
      return rejectWithValue(error.message);
    } catch (error) {
      const handledError = handleApiError(error);
      return rejectWithValue(handledError.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/user/profile', userData);
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data.user;
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/change-password', passwordData);
      if (response.data.message) {
        showToastMessage(response.data.message, 'success');
      }
      return response.data;
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue(handledError.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'user/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/refresh-token');
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      const error = handleApiError({ response });
      if (error.message) {
        showToastMessage(error.message, 'error');
      }
      return rejectWithValue({ success: false, message: error.message });
    } catch (error) {
      const handledError = handleApiError(error);
      if (handledError.message) {
        showToastMessage(handledError.message, 'error');
      }
      return rejectWithValue({ success: false, message: handledError.message });
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  updateLoading: false,
  updateError: null,
  passwordChangeLoading: false,
  passwordChangeError: null,
  requiresVerification: false,
  pendingEmail: null,
  otpLoading: false,
  otpError: null,
  resetLoading: false,
  resetError: null,
  forgotLoading: false,
  forgotError: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.updateError = null;
      state.passwordChangeError = null;
      state.requiresVerification = false;
      state.pendingEmail = null;
      state.otpError = null;
      state.resetError = null;
      state.forgotError = null;
    },
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
      state.passwordChangeError = null;
      state.otpError = null;
      state.resetError = null;
      state.forgotError = null;
    },
    clearPasswordChangeError: (state) => {
      state.passwordChangeError = null;
    },
    clearOtpError: (state) => {
      state.otpError = null;
    },
    clearResetError: (state) => {
      state.resetError = null;
    },
    clearForgotError: (state) => {
      state.forgotError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.requiresVerification = false;
          state.pendingEmail = null;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.requiresVerification = false;
        state.pendingEmail = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.requiresVerification = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.requiresVerification) {
          state.requiresVerification = true;
          state.pendingEmail = action.payload.emailId;
          state.user = null;
          state.isAuthenticated = false;
          state.error = null;
        } else {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.requiresVerification = false;
          state.pendingEmail = null;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.requiresVerification = false;
        state.pendingEmail = null;
        state.otpError = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })
      .addCase(resendOTP.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpError = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.forgotLoading = true;
        state.forgotError = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotLoading = false;
        state.forgotError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotLoading = false;
        state.forgotError = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetError = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.requiresVerification = false;
        state.pendingEmail = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        state.requiresVerification = false;
        state.pendingEmail = null;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.user = action.payload;
        state.updateError = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      .addCase(changeUserPassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = null;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload;
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  logout,
  clearError,
  clearPasswordChangeError,
  clearOtpError,
  clearResetError,
  clearForgotError
} = userSlice.actions;

export default userSlice.reducer;
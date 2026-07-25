import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axiosInstance from "../../axiosInstance"

export const getReviews = createAsyncThunk(
  "review/getReviews",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/user/getReview")
      return res?.data?.data || []
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

export const sendReview = createAsyncThunk(
  "review/sendReview",
  async (reviewData, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post("/user/review", reviewData)
      
      // After successful submission, fetch fresh reviews
      if (res?.data?.success) {
        await dispatch(getReviews())
      }
      
      return res?.data || null
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message)
    }
  }
)

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    reviews: [],
    loading: false,
    error: null,
    success: false,
    fetched: false,
    submitting: false 
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = false
    },
    resetReviewState: (state) => {
      state.loading = false
      state.error = null
      state.success = false
      state.submitting = false
    },
    resetFetched: (state) => {
      state.fetched = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Reviews
      .addCase(getReviews.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.loading = false
        state.reviews = action.payload || []
        state.fetched = true
        state.error = null
      })
      .addCase(getReviews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.fetched = false
      })
      
      // Send Review
      .addCase(sendReview.pending, (state) => {
        state.submitting = true
        state.success = false
        state.error = null
      })
      .addCase(sendReview.fulfilled, (state, action) => {
        state.submitting = false
        state.success = true
        
      })
      .addCase(sendReview.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
        state.success = false
      })
  }
})

export const { clearError, clearSuccess, resetReviewState, resetFetched } = reviewSlice.actions
export default reviewSlice.reducer
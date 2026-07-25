import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const getQR = createAsyncThunk(
  "qr/getQR",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/qr/get-qr");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch QR code"
      );
    }
  }
);

export const addOrUpdateQR = createAsyncThunk(
  "qr/addOrUpdateQR",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/qr/add-or-update-qr", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add/update QR code"
      );
    }
  }
);

const initialState = {
  qrData: null,
  isLoading: false,
  isError: false,
  errorMessage: "",
  isSuccess: false,
};

const qrSlice = createSlice({
  name: "qr",
  initialState,
  reducers: {
    clearQRState: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getQR.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
      })
      .addCase(getQR.fulfilled, (state, action) => {
        state.isLoading = false;
        state.qrData = action.payload;
        state.isSuccess = true;
      })
      .addCase(getQR.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
      .addCase(addOrUpdateQR.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = "";
        state.isSuccess = false;
      })
      .addCase(addOrUpdateQR.fulfilled, (state, action) => {
        state.isLoading = false;
        state.qrData = action.payload;
        state.isSuccess = true;
      })
      .addCase(addOrUpdateQR.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      });
  },
});

export const { clearQRState } = qrSlice.actions;
export default qrSlice.reducer;
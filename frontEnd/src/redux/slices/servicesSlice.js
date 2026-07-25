import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

export const fetchServices = createAsyncThunk(
  "services/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/user/getServices");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
const initialState = {
  services: [],
  filteredServices: [],
  searchQuery: "",
  activeFilter: "all",
  loading: false,
  error: null,
  servicesLoaded: false,
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.services = action.payload;
      state.filteredServices = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    filterServices: (state) => {
      let result = [...state.services];

      if (state.activeFilter === "beauty") {
        result = result.filter((cat) => cat.type === "beauty");
      } else if (state.activeFilter === "makeup") {
        result = result.filter((cat) => cat.type === "makeup");
      }

      if (state.searchQuery && state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        result = result
          .map((category) => ({
            ...category,
            items: category.items.filter(
              (item) =>
                item.name.toLowerCase().includes(query) ||
                (item.desc &&
                  item.desc.toLowerCase().includes(query))
            ),
          }))
          .filter((category) => category.items.length > 0);
      }

      state.filteredServices = result;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetServicesState: (state) => {
      state.servicesLoaded = false;
      state.services = [];
      state.filteredServices = [];
      state.searchQuery = "";
      state.activeFilter = "all";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.servicesLoaded = true;

        if (!action.payload || !Array.isArray(action.payload)) {
          state.error = "Invalid data format received from server";
          state.services = [];
          state.filteredServices = [];
          return;
        }

        state.services = action.payload;

        let result = [...action.payload];

        if (state.activeFilter === "beauty") {
          result = result.filter((cat) => cat.type === "beauty");
        } else if (state.activeFilter === "makeup") {
          result = result.filter((cat) => cat.category === "makeup");
        }

        if (state.searchQuery && state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase();
          result = result
            .map((category) => ({
              ...category,
              items: category.items.filter(
                (item) =>
                  item.name.toLowerCase().includes(query) ||
                  (item.desc &&
                    item.desc.toLowerCase().includes(query))
              ),
            }))
            .filter((category) => category.items.length > 0);
        }

        state.filteredServices = result;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.services = [];
        state.filteredServices = [];
        state.servicesLoaded = false;
      });
  },
});

export const {
  setServices,
  setSearchQuery,
  setActiveFilter,
  filterServices,
  clearError,
  resetServicesState,
} = servicesSlice.actions;
export default servicesSlice.reducer;
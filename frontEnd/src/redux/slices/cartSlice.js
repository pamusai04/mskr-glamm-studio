
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axiosInstance from "../../axiosInstance";

const initialState = {
  cart: [],
  totalServices: 0,
  subtotal: 0,
  totalDiscount: 0,
  total: 0,
  applicableOffers: [],
  appliedOffer: null,
  isCartEmpty: true,
  loading: false,
  error: null,
  offerApplying: false,
  offerError: null
};

export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/user/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (service_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/user/cart', { service_id });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cart_item_id, { rejectWithValue, dispatch, getState }) => {
    const previousCart = getState().cart.cart;
    const previousTotalServices = getState().cart.totalServices;
    const previousSubtotal = getState().cart.subtotal;
    const previousTotal = getState().cart.total;
    
    const itemToRemove = previousCart.find(item => item._id === cart_item_id);
    
    if (itemToRemove) {
      const itemTotal = itemToRemove.numberOfPersons * (itemToRemove.service_id?.price || 0);
      const newSubtotal = previousSubtotal - itemTotal;
      const newTotalServices = previousTotalServices - itemToRemove.numberOfPersons;
      
      dispatch(removeItemOptimistic({ 
        cart_item_id, 
        newSubtotal, 
        newTotalServices,
        newTotal: newSubtotal - getState().cart.totalDiscount
      }));
    }
    
    try {
      const response = await axiosInstance.delete('/user/cart', { 
        data: { cart_item_id } 
      });
      return response.data;
    } catch (error) {
      dispatch(rollbackCart(previousCart));
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const incrementCart = createAsyncThunk(
  'cart/incrementCart',
  async (cart_item_id, { rejectWithValue, dispatch, getState }) => {
    const state = getState();
    const itemToUpdate = state.cart.cart.find(item => item._id === cart_item_id);
    
    if (itemToUpdate) {
      const pricePerPerson = itemToUpdate.service_id?.price || 0;
      const newNumberOfPersons = itemToUpdate.numberOfPersons + 1;
      const oldItemTotal = itemToUpdate.numberOfPersons * pricePerPerson;
      const newItemTotal = newNumberOfPersons * pricePerPerson;
      const difference = newItemTotal - oldItemTotal;
      
      dispatch(updateItemQuantityOptimistic({
        cart_item_id,
        newNumberOfPersons,
        newItemTotal,
        subtotalDifference: difference,
        totalServicesDifference: 1
      }));
    }
    
    try {
      const response = await axiosInstance.put('/user/cart/increment', { cart_item_id });
      return response.data;
    } catch (error) {
      dispatch(getCart());
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const decrementCart = createAsyncThunk(
  'cart/decrementCart',
  async (cart_item_id, { rejectWithValue, dispatch, getState }) => {
    const state = getState();
    const itemToUpdate = state.cart.cart.find(item => item._id === cart_item_id);
    
    if (itemToUpdate && itemToUpdate.numberOfPersons > 1) {
      const pricePerPerson = itemToUpdate.service_id?.price || 0;
      const newNumberOfPersons = itemToUpdate.numberOfPersons - 1;
      const oldItemTotal = itemToUpdate.numberOfPersons * pricePerPerson;
      const newItemTotal = newNumberOfPersons * pricePerPerson;
      const difference = newItemTotal - oldItemTotal;
      
      dispatch(updateItemQuantityOptimistic({
        cart_item_id,
        newNumberOfPersons,
        newItemTotal,
        subtotalDifference: difference,
        totalServicesDifference: -1
      }));
    }
    
    try {
      const response = await axiosInstance.put('/user/cart/decrement', { cart_item_id });
      return response.data;
    } catch (error) {
      dispatch(getCart());
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const applyOfferToCart = createAsyncThunk(
  'cart/applyOfferToCart',
  async (offerId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('/user/apply-offer', { offerId });
      if (response.data.success) {
        dispatch(setAppliedOffer({
          offerId: response.data.data.offerApplied.offerId,
          title: response.data.data.offerApplied.title,
          discountValue: response.data.data.offerApplied.discountValue,
          discountAmount: response.data.data.offerApplied.discountAmount
        }));
      }
      return response.data;
    } catch (error) {
      dispatch(clearAppliedOffer());
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    removeItemOptimistic: (state, action) => {
      const { cart_item_id, newSubtotal, newTotalServices, newTotal } = action.payload;
      state.cart = state.cart.filter(item => item._id !== cart_item_id);
      state.subtotal = newSubtotal;
      state.totalServices = newTotalServices;
      state.total = newTotal;
      state.isCartEmpty = state.cart.length === 0;
      
      if (state.isCartEmpty) {
        state.appliedOffer = null;
      }
    },
    
    updateItemQuantityOptimistic: (state, action) => {
      const { cart_item_id, newNumberOfPersons, newItemTotal, subtotalDifference, totalServicesDifference } = action.payload;
      
      const item = state.cart.find(item => item._id === cart_item_id);
      if (item) {
        item.numberOfPersons = newNumberOfPersons;
        item.itemTotal = newItemTotal;
        item.finalPrice = newItemTotal;
      }
      
      state.subtotal += subtotalDifference;
      state.totalServices += totalServicesDifference;
      state.total = state.subtotal - state.totalDiscount;
    },
    
    rollbackCart: (state, action) => {
      state.cart = action.payload;
      const subtotal = state.cart.reduce((sum, item) => 
        sum + (item.numberOfPersons * (item.service_id?.price || 0)), 0);
      const totalServices = state.cart.reduce((sum, item) => 
        sum + item.numberOfPersons, 0);
      
      state.subtotal = subtotal;
      state.totalServices = totalServices;
      state.total = subtotal - state.totalDiscount;
      state.isCartEmpty = state.cart.length === 0;
    },
    
    setAppliedOffer: (state, action) => {
      state.appliedOffer = action.payload;
    },
    
    clearAppliedOffer: (state) => {
      state.appliedOffer = null;
    },
    
    clearCartState: (state) => {
      state.cart = [];
      state.totalServices = 0;
      state.subtotal = 0;
      state.totalDiscount = 0;
      state.total = 0;
      state.applicableOffers = [];
      state.appliedOffer = null;
      state.isCartEmpty = true;
      state.loading = false;
      state.error = null;
      state.offerApplying = false;
      state.offerError = null;
    },
    
    clearCartError: (state) => {
      state.error = null;
    },
    
    clearOfferError: (state) => {
      state.offerError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.cart = action.payload.data.cart;
          state.totalServices = action.payload.data.totalServices;
          state.subtotal = action.payload.data.subtotal;
          state.totalDiscount = action.payload.data.totalDiscount;
          state.total = action.payload.data.total;
          state.applicableOffers = action.payload.data.applicableOffers;
          state.isCartEmpty = action.payload.data.cart?.length === 0;
          
          if (state.isCartEmpty) {
            state.appliedOffer = null;
          }
        }
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.cart = action.payload.data.cart;
          state.totalServices = action.payload.data.totalServices;
          state.subtotal = action.payload.data.subtotal;
          state.totalDiscount = action.payload.data.totalDiscount;
          state.total = action.payload.data.total;
          state.applicableOffers = action.payload.data.applicableOffers;
          state.isCartEmpty = action.payload.data.cart?.length === 0;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          state.cart = action.payload.data.cart;
          state.totalServices = action.payload.data.totalServices;
          state.subtotal = action.payload.data.subtotal;
          state.totalDiscount = action.payload.data.totalDiscount;
          state.total = action.payload.data.total;
          state.applicableOffers = action.payload.data.applicableOffers;
          state.isCartEmpty = action.payload.data.isCartEmpty;
          
          if (state.isCartEmpty) {
            state.appliedOffer = null;
          }
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(incrementCart.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          state.cart = action.payload.data.cart;
          state.totalServices = action.payload.data.totalServices;
          state.subtotal = action.payload.data.subtotal;
          state.totalDiscount = action.payload.data.totalDiscount;
          state.total = action.payload.data.total;
          state.applicableOffers = action.payload.data.applicableOffers;
          state.isCartEmpty = action.payload.data.isCartEmpty;
        }
      })
      .addCase(incrementCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(decrementCart.fulfilled, (state, action) => {
        if (action.payload.success && action.payload.data) {
          state.cart = action.payload.data.cart;
          state.totalServices = action.payload.data.totalServices;
          state.subtotal = action.payload.data.subtotal;
          state.totalDiscount = action.payload.data.totalDiscount;
          state.total = action.payload.data.total;
          state.applicableOffers = action.payload.data.applicableOffers;
          state.isCartEmpty = action.payload.data.isCartEmpty;
        }
      })
      .addCase(decrementCart.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(applyOfferToCart.pending, (state) => {
        state.offerApplying = true;
        state.offerError = null;
      })
      .addCase(applyOfferToCart.fulfilled, (state, action) => {
        state.offerApplying = false;
        if (action.payload.success) {
          const { summary, offerApplied } = action.payload.data;
          
          state.totalDiscount = summary.discountAmount;
          state.total = summary.finalTotal;
          state.subtotal = summary.originalTotal;
          
          if (offerApplied && offerApplied.calculation) {
            const targetServiceId = offerApplied.offerId;
            
            const updatedCart = state.cart.map(item => {
              const itemServiceId = item.service_id?._id || item.service_id;
              
              if (itemServiceId === targetServiceId) {
                return {
                  ...item,
                  discount: offerApplied.discountAmount,
                  finalPrice: offerApplied.calculation.finalServiceTotal,
                  appliedOffer: {
                    title: offerApplied.title,
                    discountValue: offerApplied.discountValue,
                    discountAmount: offerApplied.discountAmount
                  }
                };
              }
              return item;
            });
            state.cart = updatedCart;
          }
        }
      })
      .addCase(applyOfferToCart.rejected, (state, action) => {
        state.offerApplying = false;
        state.offerError = action.payload;
      })
      
  }
});

export const { 
  removeItemOptimistic,
  updateItemQuantityOptimistic,
  rollbackCart,
  setAppliedOffer,
  clearAppliedOffer,
  clearCartState, 
  clearCartError, 
  clearOfferError 
} = cartSlice.actions;

export const selectCart = (state) => state.cart.cart;
export const selectTotalServices = (state) => state.cart.totalServices;
export const selectSubtotal = (state) => state.cart.subtotal;
export const selectTotalDiscount = (state) => state.cart.totalDiscount;
export const selectTotal = (state) => state.cart.total;
export const selectApplicableOffers = (state) => state.cart.applicableOffers;
export const selectAppliedOffer = (state) => state.cart.appliedOffer;
export const selectIsCartEmpty = (state) => state.cart.isCartEmpty;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;
export const selectOfferApplying = (state) => state.cart.offerApplying;

export const selectCartSummary = createSelector(
  [selectTotalServices, selectSubtotal, selectTotalDiscount, selectTotal],
  (totalServices, subtotal, totalDiscount, total) => ({
    totalServices,
    subtotal,
    totalDiscount,
    total
  })
);

export const selectCartWithCalculations = createSelector(
  [selectCart],
  (cart) => cart.map(item => ({
    ...item,
    itemTotal: item.numberOfPersons * (item.service_id?.price || 0),
    discount: item.discount || 0,
    finalPrice: item.finalPrice || (item.numberOfPersons * (item.service_id?.price || 0))
  }))
);

export default cartSlice.reducer;
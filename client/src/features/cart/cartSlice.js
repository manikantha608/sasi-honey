import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],       // [{ variantId, productId, name, label, price, quantity, imageUrl }]
  isLoading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
      state.error = null;
    },
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.variantId === action.payload.variantId);
      if (existing) {
        existing.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    },
    updateItemQty: (state, action) => {
      const { variantId, quantity } = action.payload;
      const item = state.items.find((i) => i.variantId === variantId);
      if (item) item.quantity = quantity;
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCartError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCart, addItem, updateItemQty, removeItem, clearCart,
  setCartLoading, setCartError,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export default cartSlice.reducer;

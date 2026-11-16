import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],  // [{ productId, name, imageUrl, price }]
  isLoading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    addToWishlist: (state, action) => {
      const exists = state.items.find((i) => i.productId === action.payload.productId);
      if (!exists) state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlistLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setWishlist, addToWishlist, removeFromWishlist, clearWishlist, setWishlistLoading,
} = wishlistSlice.actions;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.some((i) => i.productId === productId);

export default wishlistSlice.reducer;

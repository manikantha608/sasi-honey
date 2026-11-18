import { configureStore } from '@reduxjs/toolkit';
import authReducer       from '../features/auth/authSlice.js';
import cartReducer       from '../features/cart/cartSlice.js';
import wishlistReducer   from '../features/wishlist/wishlistSlice.js';
import productsReducer   from '../features/products/productsSlice.js';
import categoriesReducer from '../features/categories/categoriesSlice.js';

const store = configureStore({
  reducer: {
    auth:       authReducer,
    cart:       cartReducer,
    wishlist:   wishlistReducer,
    products:   productsReducer,
    categories: categoriesReducer,
  },
});

export default store;

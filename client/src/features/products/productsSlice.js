import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsService } from '../../services/products.service.js';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const res = await productsService.getAll(params);
      return res.data;  // { data: { products }, pagination }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load products');
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const res = await productsService.getBySlug(slug);
      return res.data.data.product;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Product not found');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const res = await productsService.getFeatured();
      return res.data.data.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load featured products');
    }
  }
);

export const fetchBestsellers = createAsyncThunk(
  'products/fetchBestsellers',
  async (_, { rejectWithValue }) => {
    try {
      const res = await productsService.getBestsellers();
      return res.data.data.products;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load bestsellers');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    // Listing
    items:      [],
    total:      0,
    page:       1,
    totalPages: 1,
    isLoading:  false,
    error:      null,

    // Detail
    selected:        null,
    selectedLoading: false,
    selectedError:   null,

    // Home
    featured:          [],
    bestsellers:       [],
    featuredLoading:   false,
    bestsellersLoading:false,
  },
  reducers: {
    clearSelected: (state) => {
      state.selected      = null;
      state.selectedError = null;
    },
  },
  extraReducers: (builder) => {

    // Listing
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading  = false;
        state.items      = action.payload.data.products;
        state.total      = action.payload.pagination.total;
        state.page       = action.payload.pagination.page;
        state.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });

    // Detail
    builder
      .addCase(fetchProductBySlug.pending, (state) => { state.selectedLoading = true; state.selectedError = null; })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selected        = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError   = action.payload;
      });

    // Featured
    builder
      .addCase(fetchFeaturedProducts.pending,   (state) => { state.featuredLoading = true; })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featured        = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected,  (state) => { state.featuredLoading = false; });

    // Bestsellers
    builder
      .addCase(fetchBestsellers.pending,   (state) => { state.bestsellersLoading = true; })
      .addCase(fetchBestsellers.fulfilled, (state, action) => {
        state.bestsellersLoading = false;
        state.bestsellers        = action.payload;
      })
      .addCase(fetchBestsellers.rejected,  (state) => { state.bestsellersLoading = false; });
  },
});

export const { clearSelected } = productsSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectProducts         = (s) => s.products.items;
export const selectProductsTotal    = (s) => s.products.total;
export const selectProductsPage     = (s) => s.products.page;
export const selectProductsTotalPages=(s) => s.products.totalPages;
export const selectProductsLoading  = (s) => s.products.isLoading;
export const selectProductsError    = (s) => s.products.error;
export const selectSelectedProduct  = (s) => s.products.selected;
export const selectSelectedLoading  = (s) => s.products.selectedLoading;
export const selectSelectedError    = (s) => s.products.selectedError;
export const selectFeatured         = (s) => s.products.featured;
export const selectBestsellers      = (s) => s.products.bestsellers;
export const selectFeaturedLoading  = (s) => s.products.featuredLoading;

export default productsSlice.reducer;

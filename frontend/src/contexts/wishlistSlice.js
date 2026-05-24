import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('liechtop_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getInitialState()
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload; // expects { id, name, price, image }
      const exists = state.items.find(item => item.id === product.id);
      
      if (exists) {
        state.items = state.items.filter(item => item.id !== product.id);
      } else {
        state.items.push(product);
      }
      
      localStorage.setItem('liechtop_wishlist', JSON.stringify(state.items));
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(item => item.id !== id);
      localStorage.setItem('liechtop_wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('liechtop_wishlist');
    }
  }
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;

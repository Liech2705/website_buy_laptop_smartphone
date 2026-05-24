import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
  isCartDrawerOpen: false,
  buyNowItem: null, // {id, name, price, image, variantId, quantity}
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer: (state, action) => {
      state.isCartDrawerOpen = action.payload !== undefined ? action.payload : !state.isCartDrawerOpen;
    },
    addToCart: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      // Stock check: if stock is provided and we already have enough in cart
      if (newItem.stock !== undefined && existingItem && existingItem.quantity >= newItem.stock) {
        return;
      }
      // If adding a new item and stock is 0
      if (newItem.stock !== undefined && !existingItem && newItem.stock <= 0) {
        return;
      }

      state.totalQuantity += 1;
      state.totalPrice += newItem.price;
      if (!existingItem) {
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          quantity: 1,
          totalPrice: newItem.price,
          image: newItem.image,
          variantId: newItem.variantId,
          stock: newItem.stock, // Preserve stock info for future checks
        });
      } else {
        existingItem.quantity += 1;
        existingItem.totalPrice += newItem.price;
      }
    },
    removeFromCart: (state, action) => {
      const id = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalPrice -= existingItem.totalPrice;
        state.items = state.items.filter(item => item.id !== id);
      }
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find(item => item.id === id);
      if (existingItem) {
        if (quantity <= 0) {
          state.totalQuantity -= existingItem.quantity;
          state.totalPrice -= existingItem.totalPrice;
          state.items = state.items.filter(item => item.id !== id);
        } else {
          const diff = quantity - existingItem.quantity;
          existingItem.quantity = quantity;
          existingItem.totalPrice = existingItem.price * quantity;
          state.totalQuantity += diff;
          state.totalPrice += existingItem.price * diff;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
    // Buy Now — keeps a separate single-item intent, does NOT touch cart
    setBuyNow: (state, action) => {
      state.buyNowItem = action.payload; // {id, name, price, image, variantId, quantity}
    },
    clearBuyNow: (state) => {
      state.buyNowItem = null;
    },
  },
});

export const {
  addToCart, removeFromCart, updateQuantity, clearCart,
  toggleCartDrawer, setBuyNow, clearBuyNow,
} = cartSlice.actions;

export default cartSlice.reducer;

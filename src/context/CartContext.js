import React, { createContext, useState, useEffect, useContext } from 'react';
import cartService from '../services/cartService';
import { toast } from 'react-toastify';

// Create context
const CartContext = createContext();

// Create provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    itemCount: 0,
  });

  // Load cart items from localStorage on initial render
  useEffect(() => {
    const items = cartService.getCartItems();
    setCartItems(items);
    updateCartTotals(items);
  }, []);

  // Calculate and update cart totals
  const updateCartTotals = (items = cartItems) => {
    setCartTotals(cartService.calculateCartTotals());
  };

  // Add item to cart
  const addToCart = (item) => {
    const updatedItems = cartService.addToCart(item);
    setCartItems(updatedItems);
    updateCartTotals(updatedItems);
    toast.success(`${item.name} added to cart!`);
  };

  // Update item quantity
  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }
    
    const updatedItems = cartService.updateCartItemQuantity(itemId, quantity);
    setCartItems(updatedItems);
    updateCartTotals(updatedItems);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const item = cartItems.find(item => item._id === itemId);
    const updatedItems = cartService.removeFromCart(itemId);
    setCartItems(updatedItems);
    updateCartTotals(updatedItems);
    
    if (item) {
      toast.info(`${item.name} removed from cart`);
    }
  };

  // Clear cart
  const clearCart = () => {
    cartService.clearCart();
    setCartItems([]);
    updateCartTotals([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartTotals,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 
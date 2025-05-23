const CART_KEY = 'farmer_rice_cart';

/**
 * Get cart items from local storage
 * @returns {Array} - Cart items
 */
const getCartItems = () => {
  const cartItems = localStorage.getItem(CART_KEY);
  return cartItems ? JSON.parse(cartItems) : [];
};

/**
 * Add item to cart
 * @param {Object} item - Product item to add to cart
 * @returns {Array} - Updated cart items
 */
const addToCart = (item) => {
  const cartItems = getCartItems();
  
  // Check if item already exists in cart
  const existingItemIndex = cartItems.findIndex(
    cartItem => cartItem._id === item._id
  );
  
  if (existingItemIndex !== -1) {
    // Update quantity if item exists
    cartItems[existingItemIndex].quantity += item.quantity;
  } else {
    // Add new item to cart
    cartItems.push(item);
  }
  
  // Save to localStorage
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  
  return cartItems;
};

/**
 * Update cart item quantity
 * @param {string} itemId - Item ID
 * @param {number} quantity - New quantity
 * @returns {Array} - Updated cart items
 */
const updateCartItemQuantity = (itemId, quantity) => {
  const cartItems = getCartItems();
  
  const updatedItems = cartItems.map(item => {
    if (item._id === itemId) {
      return { ...item, quantity };
    }
    return item;
  });
  
  localStorage.setItem(CART_KEY, JSON.stringify(updatedItems));
  
  return updatedItems;
};

/**
 * Remove item from cart
 * @param {string} itemId - Item ID to remove
 * @returns {Array} - Updated cart items
 */
const removeFromCart = (itemId) => {
  const cartItems = getCartItems();
  
  const filteredItems = cartItems.filter(item => item._id !== itemId);
  
  localStorage.setItem(CART_KEY, JSON.stringify(filteredItems));
  
  return filteredItems;
};

/**
 * Calculate cart totals
 * @returns {Object} - Cart totals
 */
const calculateCartTotals = () => {
  const cartItems = getCartItems();
  
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  
  // Apply tax (5% GST)
  const tax = subtotal * 0.05;
  
  // Calculate shipping (free above ₹1000, otherwise ₹100)
  const shipping = subtotal > 1000 ? 0 : 100;
  
  // Calculate total
  const total = subtotal + tax + shipping;
  
  return {
    subtotal,
    tax,
    shipping,
    total,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0)
  };
};

/**
 * Clear the cart
 * @returns {Array} - Empty array
 */
const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  return [];
};

const cartService = {
  getCartItems,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  calculateCartTotals,
  clearCart
};

export default cartService; 
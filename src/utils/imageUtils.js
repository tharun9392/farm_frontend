/**
 * Default profile image path
 * This is a static image stored in the public folder
 */
export const DEFAULT_PROFILE_IMAGE = '/assets/images/default-profile.jpg';

/**
 * Default rice product image path
 * Fallback image for rice products when the original image fails to load
 */
export const DEFAULT_RICE_PRODUCT_IMAGE = '/images/fallback/rice-product.svg';

/**
 * Default logo image path
 * Fallback image for logos when the original image fails to load
 */
export const DEFAULT_LOGO_IMAGE = '/images/fallback/logo.svg';

/**
 * Get user profile image or fallback to default
 * @param {string} profileImage - User's profile image path
 * @returns {string} - Image path to use
 */
export const getUserProfileImage = (profileImage) => {
  if (!profileImage) {
    return DEFAULT_PROFILE_IMAGE;
  }
  return profileImage;
};

/**
 * Get product image or fallback to default
 * @param {string|string[]} productImages - Product image path or array of paths
 * @returns {string} - Image path to use
 */
export const getProductImage = (productImages) => {
  if (!productImages) {
    return DEFAULT_RICE_PRODUCT_IMAGE;
  }
  
  if (Array.isArray(productImages) && productImages.length > 0) {
    return productImages[0];
  }
  
  return typeof productImages === 'string' ? productImages : DEFAULT_RICE_PRODUCT_IMAGE;
};

/**
 * Handle image loading errors by providing a fallback
 * @param {Event} event - The error event from img element
 * @param {string} fallbackImage - Optional custom fallback image path
 */
export const handleImageError = (event, fallbackImage = DEFAULT_PROFILE_IMAGE) => {
  event.target.onerror = null; // Prevent infinite loop if fallback also fails
  event.target.src = fallbackImage;
};

/**
 * Handle product image loading errors
 * @param {Event} event - The error event from img element 
 */
export const handleProductImageError = (event) => {
  handleImageError(event, DEFAULT_RICE_PRODUCT_IMAGE);
};

/**
 * Handle logo image loading errors
 * @param {Event} event - The error event from img element
 */
export const handleLogoImageError = (event) => {
  handleImageError(event, DEFAULT_LOGO_IMAGE);
}; 
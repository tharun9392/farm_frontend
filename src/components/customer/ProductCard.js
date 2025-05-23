import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import ProductImage from '../common/ProductImage';

const ProductCard = ({ product }) => {
  // Destructure product properties
  const {
    _id,
    name,
    price,
    images,
    rating,
    ratingCount,
    farmer,
    description,
    stockQuantity,
  } = product;

  // Format price to rupees with comma separators
  const formatPrice = (price) => {
    return `₹${price.toLocaleString('en-IN')}`;
  };

  // Calculate discount percentage if original price is available
  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - price) / product.originalPrice) * 100
      )
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full border border-gray-100">
      {/* Product Image */}
      <Link to={`/shop/${_id}`} className="block relative h-48 overflow-hidden bg-gray-100">
        <ProductImage
          src={images?.[0] || null}
          alt={name}
          className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500"
        />
        {stockQuantity === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {discountPercentage}% OFF
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-5 flex-grow flex flex-col">
        <Link to={`/shop/${_id}`} className="text-lg font-medium text-gray-800 hover:text-green-600 mb-1">
          {name}
        </Link>
        
        <p className="text-sm text-gray-500 mb-2">
          {farmer?.farmName || 'Local Farm'}
        </p>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-grow">
          {description && description.length > 100
            ? `${description.substring(0, 100)}...`
            : description}
        </p>

        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-500">
            <FaStar className="mr-1" />
            <span className="text-sm font-medium">{rating?.toFixed(1) || 'N/A'}</span>
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({ratingCount || 0} reviews)
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-end gap-1">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Link
            to={stockQuantity > 0 ? `/shop/${_id}` : '#'}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 ${
              stockQuantity > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {stockQuantity > 0 ? 'View' : 'Sold Out'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 
import React, { useState } from 'react';
import { FaFilter, FaSortAmountDown, FaSortAmountUpAlt, FaTimes } from 'react-icons/fa';

const ProductFilters = ({ 
  filters, 
  setFilters, 
  categories, 
  qualities,
  appliedFiltersCount,
  clearAllFilters 
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value ? parseInt(value, 10) : '' });
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFilters({
        ...filters,
        categories: [...filters.categories, value]
      });
    } else {
      setFilters({
        ...filters,
        categories: filters.categories.filter(category => category !== value)
      });
    }
  };

  const handleQualityChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFilters({
        ...filters,
        qualities: [...filters.qualities, value]
      });
    } else {
      setFilters({
        ...filters,
        qualities: filters.qualities.filter(quality => quality !== value)
      });
    }
  };

  const handleAvailabilityChange = (e) => {
    const { checked } = e.target;
    setFilters({ ...filters, inStock: checked });
  };

  return (
    <div className="relative">
      {/* Filter Button (Mobile) */}
      <div className="lg:hidden flex justify-between items-center mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2"
        >
          <FaFilter />
          <span>Filters {appliedFiltersCount > 0 && `(${appliedFiltersCount})`}</span>
        </button>

        {appliedFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 border border-gray-300 text-gray-600 rounded-lg text-sm flex items-center space-x-1"
          >
            <FaTimes size={12} />
            <span>Clear All</span>
          </button>
        )}

        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            {filters.sortBy.includes('asc') ? <FaSortAmountUpAlt /> : <FaSortAmountDown />}
          </div>
        </div>
      </div>

      {/* Filters Desktop */}
      <div className={`lg:block ${isFilterOpen ? 'block' : 'hidden'} bg-white lg:bg-transparent p-4 rounded-lg lg:p-0 shadow-lg lg:shadow-none fixed lg:relative left-0 right-0 bottom-0 top-1/4 lg:top-auto z-50 overflow-auto pb-20`}>
        <div className="lg:hidden flex justify-between items-center mb-4 sticky top-0 bg-white p-2">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={() => setIsFilterOpen(false)} className="p-1">
            <FaTimes />
          </button>
        </div>

        {/* Desktop Sort */}
        <div className="hidden lg:block mb-6">
          <h3 className="text-lg font-semibold mb-3">Sort By</h3>
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 leading-tight focus:outline-none focus:border-green-500"
          >
            <option value="featured">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Price Range</h3>
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Min</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
            <span className="text-gray-500">-</span>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Max</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">₹</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handlePriceChange}
                  placeholder="10000"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Rice Types</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    value={category}
                    checked={filters.categories.includes(category)}
                    onChange={handleCategoryChange}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-gray-700">
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality */}
        {qualities?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Quality</h3>
            <div className="space-y-2">
              {qualities.map((quality) => (
                <div key={quality} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`quality-${quality}`}
                    value={quality}
                    checked={filters.qualities.includes(quality)}
                    onChange={handleQualityChange}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor={`quality-${quality}`} className="ml-2 text-gray-700">
                    {quality}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Availability</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              checked={filters.inStock}
              onChange={handleAvailabilityChange}
              className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="inStock" className="ml-2 text-gray-700">
              In Stock Only
            </label>
          </div>
        </div>

        {/* Clear Filters - Mobile */}
        <div className="mt-6 lg:hidden">
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 
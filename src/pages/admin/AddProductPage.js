import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';
import { FaUpload, FaSpinner } from 'react-icons/fa';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'basmati',
    price: '',
    availableQuantity: '',
    unit: 'kg',
    organicCertified: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image format. Please use JPG, PNG, GIF or WEBP.`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Preview images
    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);
    
    // Create preview URLs
    const newUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);
    
    // Reset the file input for better UX
    e.target.value = null;
  };

  // Remove image from preview
  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    const newUrls = [...imagePreviewUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setImageFiles(newFiles);
    setImagePreviewUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Enhanced validation
      if (!formData.name.trim()) {
        toast.error('Product name is required');
        setLoading(false);
        return;
      }
      
      // Check description length (minimum 10 characters required by server validation)
      if (!formData.description || formData.description.trim().length < 10) {
        toast.error('Description must be at least 10 characters long');
        setLoading(false);
        return;
      }
      
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Please enter a valid price');
        setLoading(false);
        return;
      }
      
      if (!formData.availableQuantity || parseFloat(formData.availableQuantity) <= 0) {
        toast.error('Please enter a valid quantity');
        setLoading(false);
        return;
      }
      
      if (imageFiles.length === 0) {
        toast.error('Please upload at least one product image');
        setLoading(false);
        return;
      }
      
      // First upload the images to get the actual server URLs
      const uploadFormData = new FormData();
      imageFiles.forEach(file => {
        uploadFormData.append('images', file);
      });
      
      // Upload images and get back the URLs from server
      const uploadResponse = await productService.uploadProductImages(uploadFormData);
      if (!uploadResponse.success || !uploadResponse.imageUrls || uploadResponse.imageUrls.length === 0) {
        throw new Error('Failed to upload product images');
      }
      
      // Prepare minimal data structure with derived riceType property matching category
      // Now using actual server image URLs instead of temporary browser URLs
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(), // No default value here to ensure proper validation
        category: formData.category,
        riceType: formData.category, // Use same value as category for riceType 
        price: parseFloat(formData.price),
        availableQuantity: parseFloat(formData.availableQuantity),
        unit: formData.unit,
        organicCertified: formData.organicCertified,
        images: uploadResponse.imageUrls // Use the server URLs instead of browser URLs
      };
      
      console.log('Submitting product data:', productData);
      
      // Submit the product to the server - productService now handles all the details
      const response = await productService.createProduct(productData);
      
      toast.success('Product added successfully!');
      
      // Redirect to products page
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      // Display more detailed error messages
      const errorMessage = error.response?.data?.message || 
                          error.details || 
                          error.message || 
                          'Failed to add product. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="bg-primary-700 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="mt-1 text-sm text-primary-100">
                Add a new rice product to the customer shop
              </p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
                  {/* Product Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter product name"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="basmati">Basmati Rice</option>
                      <option value="brown">Brown Rice</option>
                      <option value="jasmine">Jasmine Rice</option>
                      <option value="sona_masoori">Sona Masoori</option>
                      <option value="ponni">Ponni Rice</option>
                      <option value="other">Other Variety</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price (₹/kg) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="price"
                        id="price"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter price per kg"
                      />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div>
                    <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                      Available Quantity (kg) <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="availableQuantity"
                        id="availableQuantity"
                        min="0"
                        step="0.1"
                        value={formData.availableQuantity}
                        onChange={handleChange}
                        required
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter quantity in kg"
                      />
                    </div>
                  </div>

                  {/* Organic Certified */}
                  <div className="flex items-center pt-4">
                    <input
                      id="organicCertified"
                      name="organicCertified"
                      type="checkbox"
                      checked={formData.organicCertified}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="organicCertified" className="ml-2 block text-sm text-gray-700">
                      Organic Certified
                    </label>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Minimum 10 characters)</span>
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="description"
                        name="description"
                        rows={6}
                        value={formData.description}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base"
                        placeholder="Provide a detailed description of the product (at least 10 characters)"
                        minLength={10}
                        required
                      />
                    </div>
                  </div>

                  {/* Product Images */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Images <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload images</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              multiple
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Image Previews in a contained box - moved outside the grid to fix layout issues */}
                {imagePreviewUrls.length > 0 && (
                  <div className="border rounded-md p-4 mt-4">
                    <h3 className="text-sm font-semibold mb-2">Image Previews</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                            <img
                              src={url}
                              alt={`Preview ${index}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 mt-4">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/products')}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                          Processing...
                        </span>
                      ) : 'Add Product'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProductPage; 
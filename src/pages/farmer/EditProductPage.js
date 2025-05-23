import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';

const EditProductPage = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [serverErrors, setServerErrors] = useState(null);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(productId);
        setProduct(response.product);
        setExistingImages(response.product.images || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
        setLoading(false);
        toast.error('Error loading product');
      }
    };

    fetchProduct();
  }, [productId]);

  // Validation schema
  const ProductSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be less than 100 characters')
      .required('Name is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be less than 1000 characters')
      .required('Description is required'),
    category: Yup.string()
      .oneOf(['basmati', 'brown', 'jasmine', 'sona_masoori', 'ponni', 'other'], 'Invalid category')
      .required('Category is required'),
    price: Yup.number()
      .positive('Price must be positive')
      .required('Price is required'),
    availableQuantity: Yup.number()
      .positive('Quantity must be positive')
      .integer('Quantity must be a whole number')
      .required('Available quantity is required'),
    unit: Yup.string()
      .oneOf(['kg', 'g', 'lb', 'ton'], 'Invalid unit')
      .required('Unit is required'),
    organicCertified: Yup.boolean(),
    harvestedDate: Yup.date()
      .max(new Date(), 'Harvest date cannot be in the future')
      .nullable()
  });

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Preview images
    const newImageFiles = [...imageFiles, ...files];
    setImageFiles(newImageFiles);
    
    // Create preview URLs
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);
  };

  // Remove new image from preview
  const removeNewImage = (index) => {
    const newFiles = [...imageFiles];
    const newUrls = [...imagePreviewUrls];
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(newUrls[index]);
    
    newFiles.splice(index, 1);
    newUrls.splice(index, 1);
    
    setImageFiles(newFiles);
    setImagePreviewUrls(newUrls);
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    const updatedImages = [...existingImages];
    updatedImages.splice(index, 1);
    setExistingImages(updatedImages);
  };

  // Upload images to server
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await productService.uploadProductImages(formData);
      return response.imageUrls || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.warning('Failed to upload images. Continuing with existing images.');
      return [];
    }
  };

  // Form submission handler
  const handleSubmit = async (values, { setErrors }) => {
    try {
      setIsSubmitting(true);
      setServerErrors(null);
      
      // Upload new images if any
      let newImageUrls = [];
      if (imageFiles.length > 0) {
        try {
          newImageUrls = await uploadImages();
          console.log('Uploaded image URLs:', newImageUrls);
        } catch (uploadError) {
          console.error('Image upload failed but continuing with product update:', uploadError);
          toast.warning('Could not upload new images, but will continue updating the product.');
        }
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];
      
      // Process qualityParameters to ensure valid values
      const cleanedQualityParams = {};
      
      if (values.qualityParameters) {
        if (values.qualityParameters.moisture !== undefined && values.qualityParameters.moisture !== '') {
          cleanedQualityParams.moisture = Number(values.qualityParameters.moisture);
        }
        
        if (values.qualityParameters.brokenGrains !== undefined && values.qualityParameters.brokenGrains !== '') {
          cleanedQualityParams.brokenGrains = Number(values.qualityParameters.brokenGrains);
        }
        
        if (values.qualityParameters.foreignMatter !== undefined && values.qualityParameters.foreignMatter !== '') {
          cleanedQualityParams.foreignMatter = Number(values.qualityParameters.foreignMatter);
        }
        
        if (values.qualityParameters.aroma) {
          cleanedQualityParams.aroma = values.qualityParameters.aroma;
        }
        
        if (values.qualityParameters.color) {
          cleanedQualityParams.color = values.qualityParameters.color;
        }
        
        if (values.qualityParameters.grainLength !== undefined && values.qualityParameters.grainLength !== '') {
          cleanedQualityParams.grainLength = Number(values.qualityParameters.grainLength);
        }
      }
      
      // Update product data
      const productData = {
        name: values.name,
        description: values.description,
        category: values.category,
        riceType: values.category,
        price: Number(values.price),
        farmerPrice: Number(values.price),
        availableQuantity: Number(values.availableQuantity),
        stockQuantity: Number(values.availableQuantity),
        unit: values.unit,
        organicCertified: !!values.organicCertified,
        images: allImages,
        qualityParameters: Object.keys(cleanedQualityParams).length > 0 ? cleanedQualityParams : undefined,
        harvestedDate: values.harvestedDate || undefined,
        certifications: values.certifications || []
      };
      
      // Update product
      await productService.updateProduct(productId, productData);
      toast.success('Product updated successfully!');
      navigate('/farmer/products');
    } catch (error) {
      console.error('Error updating product:', error);
      
      // Handle validation errors
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const formattedErrors = {};
        error.response.data.errors.forEach(err => {
          formattedErrors[err.param] = err.msg;
        });
        setErrors(formattedErrors);
      } else {
        setServerErrors(error.response?.data?.message || 'Failed to update product. Please try again.');
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error || 'Product not found'}
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/farmer/products')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
          
          <Formik
            initialValues={{
              name: product.name || '',
              description: product.description || '',
              category: product.category || product.riceType || '',
              price: product.price || product.farmerPrice || 0,
              availableQuantity: product.availableQuantity || product.stockQuantity || 0,
              unit: product.unit || 'kg',
              organicCertified: product.organicCertified || false,
              harvestedDate: product.harvestedDate ? new Date(product.harvestedDate).toISOString().split('T')[0] : '',
              qualityParameters: {
                moisture: product.qualityParameters?.moisture || '',
                brokenGrains: product.qualityParameters?.brokenGrains || '',
                foreignMatter: product.qualityParameters?.foreignMatter || '',
                aroma: product.qualityParameters?.aroma || '',
                color: product.qualityParameters?.color || '',
                grainLength: product.qualityParameters?.grainLength || ''
              },
              certifications: product.certifications || []
            }}
            validationSchema={ProductSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, setFieldValue }) => (
              <Form className="mt-6 space-y-8">
                {serverErrors && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {serverErrors}
                  </div>
                )}
                
                {/* Basic Information */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Basic Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Essential details about your rice product.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      {/* Product Name */}
                      <div className="sm:col-span-3">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
                        <div className="mt-1">
                          <Field
                            type="text"
                            name="name"
                            id="name"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Category */}
                      <div className="sm:col-span-3">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Rice Type
                        </label>
                        <div className="mt-1">
                          <Field
                            as="select"
                            name="category"
                            id="category"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="">Select Rice Type</option>
                            <option value="basmati">Basmati Rice</option>
                            <option value="brown">Brown Rice</option>
                            <option value="jasmine">Jasmine Rice</option>
                            <option value="sona_masoori">Sona Masoori</option>
                            <option value="ponni">Ponni Rice</option>
                            <option value="other">Other Variety</option>
                          </Field>
                        </div>
                        <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Price */}
                      <div className="sm:col-span-2">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price (₹)
                        </label>
                        <div className="mt-1">
                          <Field
                            type="number"
                            name="price"
                            id="price"
                            min="0"
                            step="0.01"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Available Quantity */}
                      <div className="sm:col-span-2">
                        <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                          Available Quantity
                        </label>
                        <div className="mt-1">
                          <Field
                            type="number"
                            name="availableQuantity"
                            id="availableQuantity"
                            min="0"
                            step="1"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <ErrorMessage name="availableQuantity" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Unit */}
                      <div className="sm:col-span-2">
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                          Unit
                        </label>
                        <div className="mt-1">
                          <Field
                            as="select"
                            name="unit"
                            id="unit"
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          >
                            <option value="kg">Kilogram (kg)</option>
                            <option value="g">Gram (g)</option>
                            <option value="lb">Pound (lb)</option>
                            <option value="ton">Ton</option>
                          </Field>
                        </div>
                        <ErrorMessage name="unit" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Description */}
                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1">
                          <Field
                            as="textarea"
                            name="description"
                            id="description"
                            rows={3}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Organic Certification */}
                      <div className="sm:col-span-6">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <Field
                              type="checkbox"
                              name="organicCertified"
                              id="organicCertified"
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="organicCertified" className="font-medium text-gray-700">
                              Organic Certified
                            </label>
                            <p className="text-gray-500">
                              Check this box if your product is certified organic.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Product Images */}
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Product Images</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Upload high-quality images of your rice product.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {existingImages.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Product ${index + 1}`}
                                className="h-32 w-full object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/fallback/rice-product.svg';
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Images Upload */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Upload New Images</h4>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="images"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none"
                            >
                              <span>Upload files</span>
                              <input
                                id="images"
                                name="images"
                                type="file"
                                multiple
                                accept="image/*"
                                className="sr-only"
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
                    
                    {/* New Image Previews */}
                    {imagePreviewUrls.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {imagePreviewUrls.map((url, index) => (
                            <div key={index} className="relative">
                              <img
                                src={url}
                                alt={`Upload preview ${index + 1}`}
                                className="h-32 w-full object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/farmer/products')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      'Update Product'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProductPage; 
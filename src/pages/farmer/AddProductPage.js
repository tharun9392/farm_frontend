import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import productService from '../../services/productService';

const AddProductPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [serverErrors, setServerErrors] = useState(null);

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
      .nullable(),
    qualityParameters: Yup.object().shape({
      moisture: Yup.number().min(0).max(100).nullable(),
      brokenGrains: Yup.number().min(0).max(100).nullable(),
      foreignMatter: Yup.number().min(0).max(100).nullable(),
      aroma: Yup.string().oneOf(['strong', 'medium', 'mild', 'none']).nullable(),
      color: Yup.string().nullable(),
      grainLength: Yup.number().positive().nullable()
    }),
    certifications: Yup.array().of(Yup.string())
  });

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

  // Upload images to server
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    try {
      const formData = new FormData();
      imageFiles.forEach(file => {
        formData.append('images', file);
      });
      
      // Show loading toast
      const toastId = toast.loading("Uploading images...");
      
      try {
        const response = await productService.uploadProductImages(formData);
        
        // Update loading toast to success
        toast.update(toastId, { 
          render: `Successfully uploaded ${response.imageUrls.length} images`, 
          type: "success", 
          isLoading: false,
          autoClose: 3000
        });
        
        return response.imageUrls || [];
      } catch (uploadError) {
        // Check if 404 error which means endpoint is not implemented
        if (uploadError.response && uploadError.response.status === 404) {
          console.warn('Upload endpoint not available, using local URLs instead');
          
          // Update loading toast to info
          toast.update(toastId, { 
            render: "Using local image preview (server upload not available)", 
            type: "info", 
            isLoading: false,
            autoClose: 3000
          });
          
          // Return empty array since we can't actually upload files without the endpoint
          return [];
        }
        
        // Update loading toast to error
        toast.update(toastId, { 
          render: "Failed to upload images", 
          type: "error", 
          isLoading: false,
          autoClose: 3000
        });
        
        throw uploadError; // Re-throw for the outer catch block
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images. Continuing without images.');
      
      // Just continue with product creation without images
      return [];
    }
  };

  // Form submission handler
  const handleSubmit = async (values, { resetForm, setErrors }) => {
    try {
      setIsSubmitting(true);
      setServerErrors(null);
      
      // First upload images if any
      let imageUrls = [];
      if (imageFiles.length > 0) {
        try {
          imageUrls = await uploadImages();
          console.log('Uploaded image URLs:', imageUrls);
        } catch (uploadError) {
          console.error('Image upload failed but continuing with product creation:', uploadError);
          toast.warning('Could not upload images, but will continue creating the product.');
          // Proceed with empty imageUrls
        }
      }
      
      // Process qualityParameters to ensure valid values or remove empty fields
      const cleanedQualityParams = {};
      
      // Only add non-empty values with proper types
      if (values.qualityParameters) {
        if (values.qualityParameters.moisture !== undefined && values.qualityParameters.moisture !== '' && 
            !isNaN(Number(values.qualityParameters.moisture))) {
          cleanedQualityParams.moisture = Number(values.qualityParameters.moisture);
        }
        
        if (values.qualityParameters.brokenGrains !== undefined && values.qualityParameters.brokenGrains !== '' && 
            !isNaN(Number(values.qualityParameters.brokenGrains))) {
          cleanedQualityParams.brokenGrains = Number(values.qualityParameters.brokenGrains);
        }
        
        if (values.qualityParameters.foreignMatter !== undefined && values.qualityParameters.foreignMatter !== '' && 
            !isNaN(Number(values.qualityParameters.foreignMatter))) {
          cleanedQualityParams.foreignMatter = Number(values.qualityParameters.foreignMatter);
        }
        
        if (values.qualityParameters.aroma && 
            ['strong', 'medium', 'mild', 'none'].includes(values.qualityParameters.aroma)) {
          cleanedQualityParams.aroma = values.qualityParameters.aroma;
        }
        
        if (values.qualityParameters.color && values.qualityParameters.color.trim() !== '') {
          cleanedQualityParams.color = values.qualityParameters.color.trim();
        }
        
        if (values.qualityParameters.grainLength !== undefined && values.qualityParameters.grainLength !== '' && 
            !isNaN(Number(values.qualityParameters.grainLength))) {
          cleanedQualityParams.grainLength = Number(values.qualityParameters.grainLength);
        }
      }
      
      // Create product with uploaded image URLs and cleaned parameters
      const productData = {
        name: values.name.trim(),
        description: values.description.trim(),
        category: values.category,
        riceType: values.category,
        price: Number(values.price) || 0,
        farmerPrice: Number(values.price) || 0,
        availableQuantity: Number(values.availableQuantity) || 0,
        stockQuantity: Number(values.availableQuantity) || 0,
        unit: values.unit || 'kg',
        organicCertified: !!values.organicCertified,
        images: imageUrls.length > 0 ? imageUrls : [],
        qualityParameters: Object.keys(cleanedQualityParams).length > 0 ? cleanedQualityParams : null,
        harvestedDate: values.harvestedDate && Date.parse(values.harvestedDate) ? values.harvestedDate : null,
        certifications: values.certifications || []
      };

      console.log('Sending product data:', productData);
      console.log('Data types check - price:', typeof productData.price, productData.price);
      console.log('Data types check - availableQuantity:', typeof productData.availableQuantity, productData.availableQuantity);
      console.log('Data types check - qualityParameters:', productData.qualityParameters);
      
      // Try to create the product
      try {
        const result = await productService.createProduct(productData);
        console.log('Product created successfully:', result);
        
        toast.success('Product created successfully!');
        resetForm();
        setImageFiles([]);
        setImagePreviewUrls([]);
        
        // Redirect to products list
        navigate('/farmer/products');
      } catch (createError) {
        console.error('Error creating product:', createError);
        
        // Enhanced error logging to see exactly what's failing
        if (createError.response) {
          console.error('Response status:', createError.response.status);
          console.error('Response data:', createError.response.data);
          console.error('Response headers:', createError.response.headers);
        }
        
        // Try to extract validation errors from the response
        const errorMessage = createError.response?.data?.message || createError.details || 'Failed to create product. Please try again.';
        toast.error(errorMessage);
        
        // Set server errors to display them in UI
        setServerErrors(errorMessage);
        
        // If the server returns field-specific errors, set them in Formik
        if (createError.response?.data?.errors) {
          const serverFieldErrors = {};
          Object.keys(createError.response.data.errors).forEach(field => {
            serverFieldErrors[field] = createError.response.data.errors[field].message;
          });
          setErrors(serverFieldErrors);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Rice Product</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new rice product to list on the marketplace
          </p>
          
          {serverErrors && (
            <div className="my-4 p-4 bg-red-50 border border-red-300 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error creating product</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{typeof serverErrors === 'string' ? serverErrors : 'Please correct the errors and try again.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            <Formik
              initialValues={{
                name: '',
                description: '',
                category: '',
                price: '',
                availableQuantity: '',
                unit: 'kg',
                organicCertified: false,
                harvestedDate: '',
                qualityParameters: {
                  moisture: '',
                  brokenGrains: '',
                  foreignMatter: '',
                  aroma: '',
                  color: '',
                  grainLength: ''
                },
                certifications: []
              }}
              validationSchema={ProductSchema}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, setFieldValue }) => (
                <Form className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Product Name *
                        </label>
                        <Field
                          type="text"
                          name="name"
                          id="name"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="e.g., Premium Basmati Rice"
                        />
                        <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category *
                        </label>
                        <Field
                          as="select"
                          name="category"
                          id="category"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="">Select Rice Type</option>
                          <option value="basmati">Basmati Rice</option>
                          <option value="brown">Brown Rice</option>
                          <option value="jasmine">Jasmine Rice</option>
                          <option value="sona_masoori">Sona Masoori</option>
                          <option value="ponni">Ponni Rice</option>
                          <option value="other">Other Variety</option>
                        </Field>
                        <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description *
                        </label>
                        <Field
                          as="textarea"
                          name="description"
                          id="description"
                          rows="4"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="Describe your rice product, including origin, taste profile, cooking recommendations, etc."
                        />
                        <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                          Price (₹/kg) *
                        </label>
                        <Field
                          type="number"
                          name="price"
                          id="price"
                          min="0"
                          step="0.01"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                      </div>

                      <div>
                        <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700">
                          Available Quantity (in kg) *
                        </label>
                        <Field
                          type="number"
                          name="availableQuantity"
                          id="availableQuantity"
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="availableQuantity" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Quality Parameters */}
                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Quality Parameters (Optional)</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Provide quality specifications for your rice product
                    </p>
                    
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label htmlFor="qualityParameters.moisture" className="block text-sm font-medium text-gray-700">
                          Moisture Content (%)
                        </label>
                        <Field
                          type="number"
                          name="qualityParameters.moisture"
                          id="qualityParameters.moisture"
                          min="0"
                          max="100"
                          step="0.1"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="qualityParameters.moisture" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="qualityParameters.brokenGrains" className="block text-sm font-medium text-gray-700">
                          Broken Grains (%)
                        </label>
                        <Field
                          type="number"
                          name="qualityParameters.brokenGrains"
                          id="qualityParameters.brokenGrains"
                          min="0"
                          max="100"
                          step="0.1"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="qualityParameters.brokenGrains" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="qualityParameters.foreignMatter" className="block text-sm font-medium text-gray-700">
                          Foreign Matter (%)
                        </label>
                        <Field
                          type="number"
                          name="qualityParameters.foreignMatter"
                          id="qualityParameters.foreignMatter"
                          min="0"
                          max="100"
                          step="0.1"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="qualityParameters.foreignMatter" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="qualityParameters.grainLength" className="block text-sm font-medium text-gray-700">
                          Grain Length (mm)
                        </label>
                        <Field
                          type="number"
                          name="qualityParameters.grainLength"
                          id="qualityParameters.grainLength"
                          min="0"
                          step="0.1"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="qualityParameters.grainLength" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="qualityParameters.aroma" className="block text-sm font-medium text-gray-700">
                          Aroma
                        </label>
                        <Field
                          as="select"
                          name="qualityParameters.aroma"
                          id="qualityParameters.aroma"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="">Select Aroma</option>
                          <option value="strong">Strong</option>
                          <option value="medium">Medium</option>
                          <option value="mild">Mild</option>
                          <option value="none">None</option>
                        </Field>
                        <ErrorMessage name="qualityParameters.aroma" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div>
                        <label htmlFor="qualityParameters.color" className="block text-sm font-medium text-gray-700">
                          Color Description
                        </label>
                        <Field
                          type="text"
                          name="qualityParameters.color"
                          id="qualityParameters.color"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          placeholder="e.g., White, Golden, Off-white"
                        />
                        <ErrorMessage name="qualityParameters.color" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Details */}
                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Additional Details</h2>
                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label htmlFor="harvestedDate" className="block text-sm font-medium text-gray-700">
                          Harvest Date
                        </label>
                        <Field
                          type="date"
                          name="harvestedDate"
                          id="harvestedDate"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="harvestedDate" component="div" className="text-red-500 text-sm mt-1" />
                      </div>
                      
                      <div className="flex items-center h-full mt-6">
                        <div className="flex items-center">
                          <Field
                            type="checkbox"
                            name="organicCertified"
                            id="organicCertified"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="organicCertified" className="ml-2 block text-sm text-gray-700">
                            Organic Certified
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Images */}
                  <div className="pt-6 border-t border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Product Images</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Upload high-quality images of your rice product
                    </p>
                    
                    <div className="mt-4">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>
                    
                    {imagePreviewUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full text-white flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={() => navigate('/farmer/products')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Product'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddProductPage; 
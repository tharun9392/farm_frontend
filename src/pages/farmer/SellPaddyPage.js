import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

const SellPaddyPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedProduct, setSubmittedProduct] = useState(null);

  const PaddySchema = Yup.object().shape({
    variety: Yup.string()
      .required('Paddy variety is required'),
    quantity: Yup.number()
      .positive('Quantity must be positive')
      .required('Quantity is required'),
    pricePerKg: Yup.number()
      .positive('Price must be positive')
      .required('Price per kg is required'),
    harvestDate: Yup.date()
      .max(new Date(), 'Harvest date cannot be in the future')
      .required('Harvest date is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .required('Description is required'),
    moisture: Yup.number()
      .min(0, 'Moisture must be positive')
      .max(100, 'Moisture cannot exceed 100%'),
    location: Yup.string()
      .required('Location is required'),
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

  // Form submission handler
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsSubmitting(true);
      
      // Only try to upload images if there are files
      let imageUrls = [];
      if (imageFiles.length > 0) {
        // Create FormData for image upload
        const formData = new FormData();
        imageFiles.forEach(file => {
          formData.append('images', file);
        });
        
        // Upload images first
        const uploadResponse = await api.post('/upload/product-images', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (uploadResponse.data && uploadResponse.data.success) {
          imageUrls = uploadResponse.data.imageUrls;
          console.log('Uploaded images:', imageUrls);
        } else {
          throw new Error('Failed to upload images');
        }
      }
      
      // Create the paddy product
      const paddyData = {
        name: `${values.variety} Paddy`,
        description: values.description,
        category: values.variety.toLowerCase().includes('basmati') ? 'basmati' :
                 values.variety.toLowerCase().includes('brown') ? 'brown' :
                 values.variety.toLowerCase().includes('jasmine') ? 'jasmine' :
                 values.variety.toLowerCase().includes('sona') ? 'sona_masoori' :
                 values.variety.toLowerCase().includes('ponni') ? 'ponni' : 'other',
        riceType: values.variety.toLowerCase().includes('basmati') ? 'basmati' :
                 values.variety.toLowerCase().includes('brown') ? 'brown' :
                 values.variety.toLowerCase().includes('jasmine') ? 'jasmine' :
                 values.variety.toLowerCase().includes('sona') ? 'sona_masoori' :
                 values.variety.toLowerCase().includes('ponni') ? 'ponni' : 'other',
        price: values.pricePerKg,
        farmerPrice: values.pricePerKg,
        availableQuantity: values.quantity,
        stockQuantity: values.quantity,
        unit: 'kg',
        images: imageUrls,
        harvestedDate: values.harvestDate,
        region: values.location,
        qualityParameters: {
          moisture: values.moisture,
        }
      };
      
      console.log('Submitting paddy data:', paddyData);
      
      // Submit the paddy product to the server
      const response = await api.post('/products/farmer/paddy', paddyData);
      
      toast.success('Your paddy offer has been submitted for review!');
      resetForm();
      setImageFiles([]);
      setImagePreviewUrls([]);
      
      // Set success state and save submitted product data
      setSubmissionSuccess(true);
      setSubmittedProduct({
        ...paddyData,
        _id: response.data?.product?._id,
        createdAt: new Date().toISOString()
      });
      
      // Don't navigate away immediately to show success message
      // navigate('/farmer/sales');
    } catch (error) {
      console.error('Error submitting paddy offer:', error);
      toast.error(error.response?.data?.message || 'Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle view sales
  const handleViewSales = () => {
    navigate('/farmer/sales');
  };

  // Handle submit another
  const handleSubmitAnother = () => {
    setSubmissionSuccess(false);
    setSubmittedProduct(null);
  };

  // Render submission success screen
  if (submissionSuccess && submittedProduct) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Paddy Submitted Successfully</h1>
            
            <div className="mt-4 bg-green-50 shadow overflow-hidden sm:rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-medium text-green-800">Your paddy has been submitted for approval</h2>
                  <p className="mt-1 text-sm text-green-700">
                    Our team will review your paddy offer and get back to you soon.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
                
                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Paddy Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{submittedProduct.name}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                    <dd className="mt-1 text-sm text-gray-900">{submittedProduct.availableQuantity} {submittedProduct.unit}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900">₹{submittedProduct.price}/{submittedProduct.unit}</dd>
                  </div>
                  
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-yellow-600 font-medium">Pending Approval</dd>
                  </div>
                </dl>
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleSubmitAnother}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Submit Another Paddy
                </button>
                
                <button
                  type="button"
                  onClick={handleViewSales}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View My Paddy Sales
                </button>
              </div>
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
          <h1 className="text-2xl font-semibold text-gray-900">Sell Paddy</h1>
          
          <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Sell Your Paddy to Us
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill out the form below to offer your paddy for sale. Our team will review your offer and get back to you promptly.
              </p>
            </div>
            
            <Formik
              initialValues={{
                variety: '',
                quantity: '',
                pricePerKg: '',
                harvestDate: '',
                description: '',
                moisture: '',
                location: '',
              }}
              validationSchema={PaddySchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isValid, dirty }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="variety" className="block text-sm font-medium text-gray-700">
                        Paddy Variety
                      </label>
                      <Field
                        type="text"
                        name="variety"
                        id="variety"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.variety && touched.variety ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                        placeholder="Enter paddy variety (e.g., Basmati, Sona Masoori)"
                      />
                      <ErrorMessage name="variety" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity (kg)
                      </label>
                      <Field
                        type="number"
                        name="quantity"
                        id="quantity"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.quantity && touched.quantity ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                        placeholder="Enter quantity in kilograms"
                      />
                      <ErrorMessage name="quantity" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="pricePerKg" className="block text-sm font-medium text-gray-700">
                        Price per kg (₹)
                      </label>
                      <Field
                        type="number"
                        name="pricePerKg"
                        id="pricePerKg"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.pricePerKg && touched.pricePerKg ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                        placeholder="Enter your asking price per kg"
                      />
                      <ErrorMessage name="pricePerKg" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700">
                        Harvest Date
                      </label>
                      <Field
                        type="date"
                        name="harvestDate"
                        id="harvestDate"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.harvestDate && touched.harvestDate ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                      />
                      <ErrorMessage name="harvestDate" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      id="description"
                      rows={4}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.description && touched.description ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                      placeholder="Provide details about your paddy (quality, growing conditions, etc.)"
                    />
                    <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="moisture" className="block text-sm font-medium text-gray-700">
                        Moisture Content (%)
                      </label>
                      <Field
                        type="number"
                        name="moisture"
                        id="moisture"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.moisture && touched.moisture ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                        placeholder="Enter moisture content"
                      />
                      <ErrorMessage name="moisture" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <Field
                        type="text"
                        name="location"
                        id="location"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.location && touched.location ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm`}
                        placeholder="Enter your location"
                      />
                      <ErrorMessage name="location" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Paddy Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
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
                    
                    {imagePreviewUrls.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Preview ${index}`}
                              className="h-24 w-24 object-cover rounded-md"
                            />
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
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !(isValid && dirty)}
                      className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        isSubmitting || !(isValid && dirty)
                          ? 'bg-primary-400 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                      }`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Offer'}
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

export default SellPaddyPage; 
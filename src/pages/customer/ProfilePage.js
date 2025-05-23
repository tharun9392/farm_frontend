import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';
import { FaCamera } from 'react-icons/fa';

const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .nullable(),
  address: Yup.object().shape({
    street: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state: Yup.string().nullable(),
    postalCode: Yup.string()
      .matches(/^[0-9]{6}$/, 'Postal code must be 6 digits')
      .nullable(),
    country: Yup.string().default('India'),
  }),
});

const CustomerProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile();
        setUserData(response.user || response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      let updatedData = { ...values };

      if (uploadedImage) {
        const formData = new FormData();
        formData.append('profileImage', uploadedImage);
        const imgRes = await userService.uploadProfileImage(formData);
        updatedData.profileImage = imgRes.imageUrl || imgRes.url;
      }

      await userService.updateProfile(updatedData);
      toast.success('Profile updated successfully');
      setUserData(updatedData);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading && !userData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Failed to load profile</h3>
            <p className="mt-1 text-sm text-gray-500">Please try refreshing the page</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="pb-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update your personal information and account settings
            </p>
          </div>

          <div className="mt-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <Formik
                initialValues={{
                  name: userData.name || '',
                  email: userData.email || '',
                  phone: userData.phone || '',
                  address: userData.address || {
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India',
                  },
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-6 p-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center">
                      <div className="relative group">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border-2 border-primary-100">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Profile Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : userData.profileImage ? (
                            <img
                              src={userData.profileImage}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold">
                              {userData.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <label
                            htmlFor="profile-image"
                            className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <FaCamera className="h-4 w-4 text-gray-600" />
                            <input
                              id="profile-image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Click the camera icon to change your profile picture
                      </p>
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <Field
                          type="text"
                          name="name"
                          id="name"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          disabled
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <Field
                          type="text"
                          name="phone"
                          id="phone"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                        <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                            Street Address
                          </label>
                          <Field
                            type="text"
                            name="address.street"
                            id="address.street"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <ErrorMessage name="address.street" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                            City
                          </label>
                          <Field
                            type="text"
                            name="address.city"
                            id="address.city"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <ErrorMessage name="address.city" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                            State
                          </label>
                          <Field
                            type="text"
                            name="address.state"
                            id="address.state"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <ErrorMessage name="address.state" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700">
                            Postal Code
                          </label>
                          <Field
                            type="text"
                            name="address.postalCode"
                            id="address.postalCode"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                          <ErrorMessage name="address.postalCode" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div>
                          <label htmlFor="address.country" className="block text-sm font-medium text-gray-700">
                            Country
                          </label>
                          <Field
                            type="text"
                            name="address.country"
                            id="address.country"
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isSubmitting || loading}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfilePage; 
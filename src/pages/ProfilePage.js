import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';

// Will create this service and function later
// import userService from '../services/userService';

const ProfilePage = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Fetch current user profile data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Placeholder - will implement userService later
        // const response = await userService.getUserProfile();
        // setUserData(response.data.user);
        
        // For now, use data from auth state
        setUserData(user);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Validation schema for profile form
  const ProfileSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    phone: Yup.string().nullable(),
    address: Yup.object().shape({
      street: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      postalCode: Yup.string().nullable(),
      country: Yup.string().default('India'),
    }),
    // Conditional validation for farmer-specific fields
    ...(user?.role === 'farmer'
      ? {
          farmDetails: Yup.object().shape({
            farmName: Yup.string().required('Farm name is required'),
            farmLocation: Yup.string().required('Farm location is required'),
            farmSize: Yup.number()
              .positive('Farm size must be a positive number')
              .nullable(),
            farmingExperience: Yup.number()
              .min(0, 'Experience must be a positive number')
              .nullable(),
          }),
        }
      : {}),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      // Create form data for image upload
      let formData = null;
      if (uploadedImage) {
        formData = new FormData();
        formData.append('profileImage', uploadedImage);
        
        // Upload image first
        // Placeholder - will implement later
        // const imageResponse = await userService.uploadProfileImage(formData);
        // values.profileImage = imageResponse.data.imageUrl;
      }
      
      // Update profile data
      // Placeholder - will implement later
      // await userService.updateProfile(values);
      
      toast.success('Profile updated successfully');
      setLoading(false);
      setSubmitting(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !userData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load profile data. Please try again.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account settings
          </p>
          
          <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
            {/* Profile Image Upload Section */}
            <div className="flex flex-col items-center pb-6 mb-6 border-b border-gray-200 sm:flex-row sm:items-start">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
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
                      <div className="h-full w-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer border border-gray-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <p className="mt-2 text-center text-xs text-gray-500 sm:text-left">
                  Click the icon to change your profile picture
                </p>
              </div>

              <div className="flex-1">
                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-medium text-gray-900">{userData.name}</h2>
                  <p className="text-sm text-gray-500">{userData.email}</p>
                  <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 capitalize">
                    {userData.role}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
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
                ...(userData.role === 'farmer'
                  ? {
                      farmDetails: userData.farmDetails || {
                        farmName: '',
                        farmLocation: '',
                        farmSize: '',
                        farmingExperience: '',
                      },
                    }
                  : {}),
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {/* Name Field */}
                    <div>
                      <label htmlFor="name" className="label">
                        Full Name
                      </label>
                      <Field
                        type="text"
                        name="name"
                        id="name"
                        className="input"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="form-error"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label htmlFor="email" className="label">
                        Email Address
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="input"
                        disabled={true} // Email is unique identifier, shouldn't be changed easily
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="form-error"
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label htmlFor="phone" className="label">
                        Phone Number
                      </label>
                      <Field
                        type="text"
                        name="phone"
                        id="phone"
                        className="input"
                      />
                      <ErrorMessage
                        name="phone"
                        component="div"
                        className="form-error"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="address.street" className="label">
                          Street Address
                        </label>
                        <Field
                          type="text"
                          name="address.street"
                          id="address.street"
                          className="input"
                        />
                        <ErrorMessage
                          name="address.street"
                          component="div"
                          className="form-error"
                        />
                      </div>

                      <div>
                        <label htmlFor="address.city" className="label">
                          City
                        </label>
                        <Field
                          type="text"
                          name="address.city"
                          id="address.city"
                          className="input"
                        />
                        <ErrorMessage
                          name="address.city"
                          component="div"
                          className="form-error"
                        />
                      </div>

                      <div>
                        <label htmlFor="address.state" className="label">
                          State / Province
                        </label>
                        <Field
                          type="text"
                          name="address.state"
                          id="address.state"
                          className="input"
                        />
                        <ErrorMessage
                          name="address.state"
                          component="div"
                          className="form-error"
                        />
                      </div>

                      <div>
                        <label htmlFor="address.postalCode" className="label">
                          Postal Code
                        </label>
                        <Field
                          type="text"
                          name="address.postalCode"
                          id="address.postalCode"
                          className="input"
                        />
                        <ErrorMessage
                          name="address.postalCode"
                          component="div"
                          className="form-error"
                        />
                      </div>

                      <div>
                        <label htmlFor="address.country" className="label">
                          Country
                        </label>
                        <Field
                          type="text"
                          name="address.country"
                          id="address.country"
                          className="input"
                        />
                        <ErrorMessage
                          name="address.country"
                          component="div"
                          className="form-error"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Farmer-specific fields */}
                  {userData.role === 'farmer' && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Farm Details
                      </h3>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="farmDetails.farmName" className="label">
                            Farm Name
                          </label>
                          <Field
                            type="text"
                            name="farmDetails.farmName"
                            id="farmDetails.farmName"
                            className="input"
                          />
                          <ErrorMessage
                            name="farmDetails.farmName"
                            component="div"
                            className="form-error"
                          />
                        </div>

                        <div>
                          <label htmlFor="farmDetails.farmLocation" className="label">
                            Farm Location
                          </label>
                          <Field
                            type="text"
                            name="farmDetails.farmLocation"
                            id="farmDetails.farmLocation"
                            className="input"
                          />
                          <ErrorMessage
                            name="farmDetails.farmLocation"
                            component="div"
                            className="form-error"
                          />
                        </div>

                        <div>
                          <label htmlFor="farmDetails.farmSize" className="label">
                            Farm Size (in acres)
                          </label>
                          <Field
                            type="number"
                            name="farmDetails.farmSize"
                            id="farmDetails.farmSize"
                            className="input"
                          />
                          <ErrorMessage
                            name="farmDetails.farmSize"
                            component="div"
                            className="form-error"
                          />
                        </div>

                        <div>
                          <label htmlFor="farmDetails.farmingExperience" className="label">
                            Farming Experience (in years)
                          </label>
                          <Field
                            type="number"
                            name="farmDetails.farmingExperience"
                            id="farmDetails.farmingExperience"
                            className="input"
                          />
                          <ErrorMessage
                            name="farmDetails.farmingExperience"
                            component="div"
                            className="form-error"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="btn btn-outline mr-3"
                      disabled={isSubmitting || loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={isSubmitting || loading}
                    >
                      {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
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

export default ProfilePage; 
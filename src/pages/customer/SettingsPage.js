import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import DashboardLayout from '../../layouts/DashboardLayout';
import userService from '../../services/userService';

const CustomerSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await userService.getUserProfile();
        setUserData(data.user || data); // handle both {user: {...}} and {...}
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load profile');
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const ProfileSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().nullable(),
    address: Yup.object().shape({
      street: Yup.string().nullable(),
      city: Yup.string().nullable(),
      state: Yup.string().nullable(),
      postalCode: Yup.string().nullable(),
      country: Yup.string().default('India'),
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      let updated = { ...values };
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('profileImage', uploadedImage);
        const imgRes = await userService.uploadProfileImage(formData);
        updated.profileImage = imgRes.imageUrl || imgRes.url;
      }
      await userService.updateProfile(updated);
      toast.success('Profile updated successfully');
      setLoading(false);
      setSubmitting(false);
      setUserData(updated);
    } catch (error) {
      toast.error('Failed to update profile');
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  if (loading && !userData) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <div className="py-10 min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">Account Settings</h1>
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
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="flex flex-col items-center pb-6">
                  <div className="relative group mb-2">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile Preview" className="h-full w-full object-cover" />
                      ) : userData.profileImage ? (
                        <img src={userData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                          {userData.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md cursor-pointer border border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">Click the icon to change your profile picture</p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="label">Full Name</label>
                    <Field type="text" name="name" id="name" className="input" />
                    <ErrorMessage name="name" component="div" className="form-error" />
                  </div>
                  <div>
                    <label htmlFor="email" className="label">Email Address</label>
                    <Field type="email" name="email" id="email" className="input" disabled />
                    <ErrorMessage name="email" component="div" className="form-error" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="label">Phone Number</label>
                    <Field type="text" name="phone" id="phone" className="input" />
                    <ErrorMessage name="phone" component="div" className="form-error" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="address.street" className="label">Street Address</label>
                      <Field type="text" name="address.street" id="address.street" className="input" />
                      <ErrorMessage name="address.street" component="div" className="form-error" />
                    </div>
                    <div>
                      <label htmlFor="address.city" className="label">City</label>
                      <Field type="text" name="address.city" id="address.city" className="input" />
                      <ErrorMessage name="address.city" component="div" className="form-error" />
                    </div>
                    <div>
                      <label htmlFor="address.state" className="label">State / Province</label>
                      <Field type="text" name="address.state" id="address.state" className="input" />
                      <ErrorMessage name="address.state" component="div" className="form-error" />
                    </div>
                    <div>
                      <label htmlFor="address.postalCode" className="label">Postal Code</label>
                      <Field type="text" name="address.postalCode" id="address.postalCode" className="input" />
                      <ErrorMessage name="address.postalCode" component="div" className="form-error" />
                    </div>
                    <div>
                      <label htmlFor="address.country" className="label">Country</label>
                      <Field type="text" name="address.country" id="address.country" className="input" />
                      <ErrorMessage name="address.country" component="div" className="form-error" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>
                    {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
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

export default CustomerSettingsPage; 
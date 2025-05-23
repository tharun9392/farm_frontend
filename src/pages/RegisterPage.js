import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../features/auth/authSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainLayout from '../layouts/MainLayout';

// Validation schema
const RegisterSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  role: Yup.string()
    .oneOf(['customer', 'farmer'], 'Invalid role selected')
    .required('Please select a role'),
  // Farmer-specific fields (conditionally required)
  farmDetails: Yup.object().when('role', {
    is: 'farmer',
    then: (schema) => schema.shape({
      farmName: Yup.string().required('Farm name is required for farmers'),
      farmLocation: Yup.string().required('Farm location is required for farmers'),
      farmSize: Yup.number()
        .positive('Farm size must be a positive number')
        .nullable(),
      farmingExperience: Yup.number()
        .min(0, 'Farming experience must be a positive number')
        .nullable(),
    }),
    otherwise: (schema) => schema.shape({
      farmName: Yup.string().nullable(),
      farmLocation: Yup.string().nullable(),
      farmSize: Yup.number().nullable(),
      farmingExperience: Yup.number().nullable(),
    }),
  }),
  // Address fields
  address: Yup.object().shape({
    street: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state: Yup.string().nullable(),
    postalCode: Yup.string().nullable(),
    country: Yup.string().default('India'),
  }),
  phone: Yup.string().nullable(),
});

const RegisterPage = () => {
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated, error } = useSelector(
    (state) => state.auth
  );

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user) {
        switch (user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'staff':
            navigate('/staff/dashboard');
            break;
          case 'farmer':
            navigate('/farmer/dashboard');
            break;
          case 'customer':
            navigate('/customer/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    }

    if (error) {
      setFormError(error);
      // Clear the error after displaying it
      setTimeout(() => {
        dispatch(reset());
      }, 5000);
    }

    return () => {
      dispatch(reset());
    };
  }, [isAuthenticated, user, error, navigate, dispatch]);

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    setFormError(null);
    
    // Remove confirmPassword from values
    const { confirmPassword, ...registrationData } = values;
    
    // Initialize the data object with basic fields
    const formattedData = {
      name: registrationData.name,
      email: registrationData.email,
      password: registrationData.password,
      role: registrationData.role,
      phone: registrationData.phone || '',
    };
    
    // Add address only if at least one address field is filled
    if (registrationData.address && (
        registrationData.address.street || 
        registrationData.address.city || 
        registrationData.address.state || 
        registrationData.address.postalCode
    )) {
      formattedData.address = {
        street: registrationData.address.street || '',
        city: registrationData.address.city || '',
        state: registrationData.address.state || '',
        postalCode: registrationData.address.postalCode || '',
        country: registrationData.address.country || 'India',
      };
    }
    
    // Add farmDetails only for farmers and only if at least one field is filled
    if (registrationData.role === 'farmer' && registrationData.farmDetails && (
        registrationData.farmDetails.farmName || 
        registrationData.farmDetails.farmLocation || 
        registrationData.farmDetails.farmSize || 
        registrationData.farmDetails.farmingExperience
    )) {
      formattedData.farmDetails = {
        farmName: registrationData.farmDetails.farmName || '',
        farmLocation: registrationData.farmDetails.farmLocation || '',
        farmSize: registrationData.farmDetails.farmSize ? Number(registrationData.farmDetails.farmSize) : undefined,
        farmingExperience: registrationData.farmDetails.farmingExperience ? Number(registrationData.farmDetails.farmingExperience) : undefined,
      };
    }

    console.log("Submitting registration data:", formattedData);
    
    dispatch(register(formattedData));
    setSubmitting(false);
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="bg-white shadow-custom rounded-lg p-6 sm:p-8">
            {formError && (
              <div className="mb-6 text-center text-red-600 bg-red-50 p-3 rounded-md border border-red-300">
                <p className="font-medium">Registration Error:</p>
                <p>{formError}</p>
              </div>
            )}

            <Formik
              initialValues={{
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'customer',
                phone: '',
                address: {
                  street: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'India',
                },
                farmDetails: {
                  farmName: '',
                  farmLocation: '',
                  farmSize: '',
                  farmingExperience: '',
                },
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values, setFieldValue }) => (
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
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="form-error"
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="label">
                        Password
                      </label>
                      <Field
                        type="password"
                        name="password"
                        id="password"
                        className="input"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="form-error"
                      />
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <label htmlFor="confirmPassword" className="label">
                        Confirm Password
                      </label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="input"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="form-error"
                      />
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label htmlFor="phone" className="label">
                        Phone Number (optional)
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

                    {/* Role Selection */}
                    <div>
                      <label htmlFor="role" className="label">
                        I am a
                      </label>
                      <Field
                        as="select"
                        name="role"
                        id="role"
                        className="input"
                      >
                        <option value="customer">Customer</option>
                        <option value="farmer">Farmer</option>
                      </Field>
                      <ErrorMessage
                        name="role"
                        component="div"
                        className="form-error"
                      />
                    </div>
                  </div>

                  {/* Address Fields */}
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Address Information (Optional)
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
                  {values.role === 'farmer' && (
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

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="btn btn-primary w-full"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>

                  <p className="text-center text-xs text-gray-600 mt-4">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage; 
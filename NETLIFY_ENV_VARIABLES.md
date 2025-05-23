# Netlify Environment Variables for Frontend Deployment

Copy and paste these exact name=value pairs into your Netlify environment variables section:

```env
REACT_APP_API_URL=https://farmerice-m6on.onrender.com/api
REACT_APP_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name/upload
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
REACT_APP_RAZORPAY_KEY_ID=rzp_test_OcWgTiP8fXd6B9
REACT_APP_ENV=production

# For local development (.env.local), use these values:
# REACT_APP_API_URL=http://localhost:5015/api
# REACT_APP_ENV=development
```

## Quick Setup Steps

1. Go to Netlify Dashboard > Site settings > Build & deploy > Environment
2. Add each variable above
3. Replace these placeholders:
   - `your-cloud-name` with your actual Cloudinary cloud name
   - `your-upload-preset` with your Cloudinary upload preset

## Important Security Notes

- Never commit these values to version control
- The API URL is pointing to your Render.com deployment
- Make sure your Cloudinary upload preset has the correct security settings
- The Razorpay key provided is a test key - replace with production key for live payments

## Variable Descriptions

- `REACT_APP_API_URL`: Your backend API on Render.com
- `REACT_APP_CLOUDINARY_URL`: Your Cloudinary upload endpoint
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary upload preset name
- `REACT_APP_RAZORPAY_KEY_ID`: Your Razorpay public key
- `REACT_APP_ENV`: Environment name (production/development)

## Important Notes

1. All environment variables in Create React App must start with `REACT_APP_`
2. Values are embedded during build time
3. After changing environment variables, you need to trigger a new deployment
4. Never commit sensitive values to version control
5. Make sure the `REACT_APP_API_URL` points to your deployed backend server, not localhost

## Development vs Production

For local development, you can create a `.env.local` file in the client directory with these variables. For production, configure them in Netlify's environment variables section.

Example local development configuration (.env.local):
```env
REACT_APP_API_URL=http://localhost:5015/api
REACT_APP_ENV=development
```

Remember to add any new environment variables to this document as they are added to the application. 
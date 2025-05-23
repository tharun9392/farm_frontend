# Deploying to Netlify

## Prerequisites

1. Create a Netlify account at https://www.netlify.com
2. Install Git if not already installed
3. Make sure your repository is pushed to GitHub

## Deployment Steps

1. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Choose GitHub as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `build`
   - These are already set in your netlify.toml file

3. **Environment Variables**
   Set the following environment variables in Netlify (Site settings > Build & deploy > Environment):
   ```
   REACT_APP_API_URL=https://farmerice-echi.onrender.com/api
   REACT_APP_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud-name/upload
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   REACT_APP_RAZORPAY_KEY_ID=your-razorpay-key
   REACT_APP_ENV=production
   ```
   Replace the placeholder values with your actual values.

4. **Deploy**
   - Click "Deploy site"
   - Netlify will start building and deploying your site
   - Wait for the build to complete

## Post-Deployment

1. **Custom Domain (Optional)**
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Follow the instructions to set up your domain

2. **HTTPS**
   - Netlify automatically provisions SSL certificates
   - Make sure HTTPS is enforced in your domain settings

3. **Continuous Deployment**
   - Your site will automatically redeploy when you push changes to your repository
   - You can trigger manual deploys from the Netlify dashboard

## Troubleshooting

1. **Build Failures**
   - Check the build logs in Netlify
   - Verify all environment variables are set correctly
   - Make sure all dependencies are listed in package.json

2. **API Connection Issues**
   - Verify your backend API is running and accessible
   - Check CORS settings in your backend
   - Verify the REACT_APP_API_URL is correct

3. **Asset Loading Issues**
   - Check the Content Security Policy in netlify.toml
   - Verify all external resources are allowed in the CSP

## Monitoring

- Use Netlify Analytics to monitor your site's performance
- Check the "Deploys" section for build history and logs
- Monitor form submissions in the "Forms" section if using Netlify Forms

## Important Notes

1. Always test changes locally before pushing to production
2. Keep your environment variables secure and never commit them to Git
3. Regular backups of your site are recommended
4. Monitor your site's performance and error logs regularly

For more detailed information about environment variables, check NETLIFY_ENV_VARIABLES.md 
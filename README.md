# Farmer Rice Management System - Frontend

## 🌾 Overview
A modern React-based frontend application for managing rice farming operations. This application provides an intuitive interface for farmers and administrators to manage farming operations, track data, and make informed decisions.

## 🚀 Features
- User authentication and authorization
- Dashboard with data visualization
- Farm management tools
- Real-time data tracking
- Responsive design for all devices
- Interactive charts and reports
- Form validation and error handling

## 🛠️ Tech Stack
- **React.js** (v18.2.0) - Frontend framework
- **Redux Toolkit** - State management
- **TailwindCSS** - Styling
- **Formik & Yup** - Form handling and validation
- **Axios** - API requests
- **Recharts** - Data visualization
- **React Router** - Navigation
- **React Toastify** - Notifications
- **Headless UI** - UI components

## 📋 Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Git

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repository/farm_frontend.git
cd farm_frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add necessary environment variables:
```env
REACT_APP_API_URL=your_api_url
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

## 🐳 Docker Support

### Development
```bash
docker build -f Dockerfile.dev -t farm-frontend-dev .
docker run -p 3000:3000 farm-frontend-dev
```

### Production
```bash
docker build -t farm-frontend .
docker run -p 80:80 farm-frontend
```

## 📦 Available Scripts

- `npm start` - Runs the development server
- `npm test` - Runs the test suite
- `npm run build` - Creates a production build
- `npm run eject` - Ejects from Create React App

## 🏗️ Project Structure
```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── features/      # Feature-specific components
├── layouts/       # Layout components
├── pages/         # Page components
├── redux/         # Redux store and slices
├── services/      # API services
├── styles/        # Style-related files
├── utils/         # Utility functions
└── config.js      # Application configuration
```

## 🚀 Deployment

The application can be deployed using various methods:

1. **Netlify**
   - Follow the instructions in `NETLIFY_ENV_VARIABLES.md`
   - Configure environment variables in Netlify dashboard
   - Deploy using the provided `netlify.toml`

2. **Docker**
   - Build the production Docker image
   - Deploy to your preferred container hosting service

3. **Traditional Hosting**
   - Run `npm run build`
   - Deploy the contents of the `build` folder

For detailed deployment instructions, refer to `DEPLOY.md`.

## 🧪 Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📝 Contributing
1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 🔑 Environment Variables
Refer to `NETLIFY_ENV_VARIABLES.md` for a complete list of required environment variables.


## 🙏 Acknowledgments
- Create React App team
- All contributors and maintainers
- Open source community

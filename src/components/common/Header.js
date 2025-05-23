import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import { logout } from '../../features/auth/authSlice';
import { getUserProfileImage, handleImageError } from '../../utils/imageUtils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const profileDropdownRef = useRef(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  // Add scroll event listener to change header style on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Handle click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  // Determine where to redirect based on user role
  const getDashboardLink = () => {
    if (!user || !user.role) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'farmer':
        return '/farmer/dashboard';
      case 'customer':
        return '/customer/dashboard';
      default:
        return '/login';
    }
  };
  
  const toggleProfileDropdown = () => {
    setProfileDropdown(!profileDropdown);
  };

  return (
    <header 
      className={`bg-white border-b border-gray-200 sticky top-0 z-30 transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.jpg" 
              alt="FarmeRice" 
              className="h-8 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/fallback/logo.png';
              }}
            />
            <span className="ml-2 text-xl font-bold text-green-700">FarmeRice</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600">Home</Link>
            <Link to="/shop" className="text-gray-700 hover:text-green-600">Shop</Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-green-600">Contact</Link>
          </nav>
          
          {/* Search, Cart, Account */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Search form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search rice products..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
              >
                <FaSearch className="text-gray-400" />
              </button>
            </form>
            
            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-green-600">
              <FaShoppingCart className="text-2xl" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Account */}
            {isAuthenticated ? (
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  className="flex items-center text-gray-700 hover:text-green-600"
                  onClick={toggleProfileDropdown}
                >
                  <span className="mr-2">{user.name ? user.name.split(' ')[0] : 'User'}</span>
                  {user.profileImage ? (
                    <img 
                      src={getUserProfileImage(user.profileImage)}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <FaUser className="text-xl" />
                  )}
                </button>
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link 
                      to={getDashboardLink()} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                    >
                      Profile
                    </Link>
                    {user.role === 'customer' && (
                      <>
                        <Link 
                          to="/orders" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        >
                          My Orders
                        </Link>
                        <Link 
                          to="/cart" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                        >
                          Cart
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-green-600"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-700">
              <FaShoppingCart className="text-2xl" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4 relative">
              <input
                type="text"
                placeholder="Search rice products..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute inset-y-0 left-0 pl-3 flex items-center"
              >
                <FaSearch className="text-gray-400" />
              </button>
            </form>
            
            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 py-2">Home</Link>
              <Link to="/shop" className="text-gray-700 py-2">Shop</Link>
              <Link to="/about" className="text-gray-700 py-2">About</Link>
              <Link to="/contact" className="text-gray-700 py-2">Contact</Link>
              
              {isAuthenticated ? (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3"></div>
                  <Link to={getDashboardLink()} className="text-gray-700 py-2">Dashboard</Link>
                  <Link to="/profile" className="text-gray-700 py-2">Profile</Link>
                  {user && user.role === 'customer' && (
                    <Link to="/orders" className="text-gray-700 py-2">My Orders</Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-gray-200 pt-3 mt-3"></div>
                  <Link to="/login" className="text-gray-700 py-2">Login</Link>
                  <Link to="/register" className="bg-green-600 text-white py-2 px-4 rounded-md text-center">Register</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 
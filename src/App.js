import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CartProvider } from './context/CartContext';

// Import components
import ProtectedRoute from './components/common/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PublicShopPage from './pages/PublicShopPage';
import PublicCartPage from './pages/PublicCartPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Import info pages
import FAQPage from './pages/info/FAQPage';
import ShippingPolicyPage from './pages/info/ShippingPolicyPage';
import ReturnPolicyPage from './pages/info/ReturnPolicyPage';
import PrivacyPolicyPage from './pages/info/PrivacyPolicyPage';
import TermsOfServicePage from './pages/info/TermsOfServicePage';
import BlogPage from './pages/info/BlogPage';

// Import dashboard pages
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import FarmerDashboard from './pages/dashboards/FarmerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import AdminMessagesPage from './pages/admin/MessagesPage';

// Import farmer module pages
import SellPaddyPage from './pages/farmer/SellPaddyPage';
import SalesHistoryPage from './pages/farmer/SalesHistoryPage';
import MessagesPage from './pages/farmer/MessagesPage';
import FarmerTransactionsPage from './pages/farmer/TransactionsPage';
import FarmerSettingsPage from './pages/farmer/SettingsPage';

// Import admin module pages
import AdminInventoryPage from './pages/admin/InventoryPage';
import InventoryPurchasePage from './pages/admin/InventoryPurchasePage';
import ProductsManagementPage from './pages/admin/ProductsManagementPage';
import PendingProductsPage from './pages/admin/PendingProductsPage';
import ProcessPaddyPage from './pages/admin/ProcessPaddyPage';
import TasksPage from './pages/admin/TasksPage';
import NewTaskPage from './pages/admin/NewTaskPage';
import FarmersPage from './pages/admin/FarmersPage';
import StaffPage from './pages/admin/StaffPage';
import AddStaffPage from './pages/admin/AddStaffPage';
import ReportsPage from './pages/admin/ReportsPage';
import OrderAnalyticsPage from './pages/admin/OrderAnalyticsPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import AnnouncementPage from './pages/admin/AnnouncementPage';
import SettingsPage from './pages/admin/SettingsPage';
import UsersPage from './pages/admin/UsersPage';
import UserDetailPage from './pages/admin/UserDetailPage';
import UserEditPage from './pages/admin/UserEditPage';
import AddProductPage from './pages/admin/AddProductPage';

// Import customer module pages
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import WriteReviewPage from './pages/customer/WriteReviewPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import WishlistPage from './pages/customer/WishlistPage';
import ReviewsPage from './pages/customer/ReviewsPage';
import CustomerSettingsPage from './pages/customer/SettingsPage';
import AddressesPage from './pages/customer/AddressesPage';
import CustomerProfilePage from './pages/customer/ProfilePage';

// Import staff module pages
import StaffCustomersPage from './pages/staff/StaffCustomersPage';
import StaffCustomerDetailPage from './pages/staff/StaffCustomerDetailPage';
import StaffFarmerDetailPage from './pages/staff/StaffFarmerDetailPage';
import StaffInventoryPage from './pages/staff/StaffInventoryPage';
import StaffOrderAnalyticsPage from './pages/staff/StaffOrderAnalyticsPage';

// Router Future Flags - Add these to remove the warning messages
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true
};

function App() {
  return (
    <Router future={routerFutureConfig}>
      <div className="App min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <CartProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/shop" element={<PublicShopPage />} />
            <Route path="/cart" element={<PublicCartPage />} />
            <Route path="/orders" element={<Navigate to="/customer/orders" replace />} />
            <Route path="/shop/product/:productId" element={<ProductDetailPage />} />
            
            {/* Info/Policy routes */}
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/blog" element={<BlogPage />} />
            
            {/* Profile route (available to all authenticated users) */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'farmer', 'staff', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Notifications route (available to all authenticated users) */}
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute allowedRoles={['customer', 'farmer', 'staff', 'admin']}>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected routes for customers */}
            <Route 
              path="/customer/*" 
              element={<ProtectedRoute allowedRoles={['customer']} />}
            >
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="shop/product/:productId" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="reviews/write/:productId" element={<WriteReviewPage />} />
              <Route path="reviews/write" element={<WriteReviewPage />} />
              <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="settings" element={<CustomerSettingsPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
            </Route>

            {/* Protected routes for farmers */}
            <Route 
              path="/farmer/*" 
              element={<ProtectedRoute allowedRoles={['farmer']} />}
            >
              <Route path="dashboard" element={<FarmerDashboard />} />
              <Route path="sell-paddy" element={<SellPaddyPage />} />
              <Route path="sales" element={<SalesHistoryPage />} />
              <Route path="transactions" element={<FarmerTransactionsPage />} />
              <Route path="settings" element={<FarmerSettingsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="messages/new" element={<MessagesPage />} />
              <Route path="messages/:userId" element={<MessagesPage />} />
            </Route>

            {/* Protected routes for staff */}
            <Route 
              path="/staff/*" 
              element={<ProtectedRoute allowedRoles={['staff']} />}
            >
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="orders" element={<OrderManagementPage />} />
              <Route path="customers" element={<StaffCustomersPage />} />
              <Route path="customers/:userId" element={<StaffCustomerDetailPage />} />
              <Route path="farmers/:userId" element={<StaffFarmerDetailPage />} />
              <Route path="farmers/:userId/products" element={<StaffFarmerDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="inventory" element={<StaffInventoryPage />} />
              <Route path="add-product" element={<AddProductPage />} />
              <Route path="order-analytics" element={<StaffOrderAnalyticsPage />} />
              <Route path="pending-products" element={<PendingProductsPage />} />
              <Route path="process-paddy" element={<ProcessPaddyPage />} />
            </Route>

            {/* Protected routes for admin */}
            <Route 
              path="/admin/*" 
              element={<ProtectedRoute allowedRoles={['admin']} />}
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="messages" element={<AdminMessagesPage />} />
              <Route path="messages/:userId" element={<AdminMessagesPage />} />
              <Route path="products" element={<ProductsManagementPage />} />
              <Route path="add-product" element={<AddProductPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="inventory/purchase" element={<InventoryPurchasePage />} />
              <Route path="pending-products" element={<PendingProductsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="tasks/new" element={<NewTaskPage />} />
              <Route path="farmers" element={<FarmersPage />} />
              <Route path="farmers/pending" element={<FarmersPage pendingOnly={true} />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/:userId" element={<UserDetailPage />} />
              <Route path="users/:userId/edit" element={<UserEditPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="staff/new" element={<AddStaffPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="orders" element={<OrderManagementPage />} />
              <Route path="order-analytics" element={<OrderAnalyticsPage />} />
              <Route path="announcements" element={<AnnouncementPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="process-paddy" element={<ProcessPaddyPage />} />
              <Route path="debug-pending" element={<PendingProductsPage />} />
            </Route>
            
            {/* Unauthorized route */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Catch all unmatched routes */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </CartProvider>
      </div>
    </Router>
  );
}

export default App;

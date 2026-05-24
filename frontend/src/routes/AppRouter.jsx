import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

import Loader from '../components/Loader';
import ProtectedRoute from './ProtectedRoute';

// --- Lazy Load Pages ---

// Public
const HomePage = lazy(() => import('../pages/public/HomePage'));
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'));
const CategoryPage = lazy(() => import('../pages/public/category/CategoryPage'));
const ProductListPage = lazy(() => import('../pages/public/product/ProductListPage'));
const ProductDetailPage = lazy(() => import('../pages/public/product/ProductDetailPage'));
const ProductSearchPage = lazy(() => import('../pages/public/product/ProductSearchPage'));

// Auth
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const VerifyAccountPage = lazy(() => import('../pages/auth/VerifyAccountPage'));

// User
// User Profile (Unified)
const ProfileLayout = lazy(() => import('../pages/user/profile/ProfileLayout'));
const ProfileInfo = lazy(() => import('../pages/user/profile/ProfileInfo'));
const AddressBook = lazy(() => import('../pages/user/profile/AddressBook'));
const ChangePassword = lazy(() => import('../pages/user/profile/ChangePassword'));
const WishlistPage = lazy(() => import('../pages/user/WishlistPage'));
const CartPage = lazy(() => import('../pages/user/CartPage'));
const CheckoutPage = lazy(() => import('../pages/user/CheckoutPage'));
const OrderHistoryPage = lazy(() => import('../pages/user/order/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('../pages/user/order/OrderDetailPage'));
const VoucherWallet = lazy(() => import('../pages/user/profile/VoucherWallet'));

// Payment
const PaymentSuccessPage = lazy(() => import('../pages/payment/PaymentSuccessPage'));
const PaymentFailPage = lazy(() => import('../pages/payment/PaymentFailPage'));

// Admin
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const AdminProductListPage = lazy(() => import('../pages/admin/product/ProductListPage'));
const AdminProductCreatePage = lazy(() => import('../pages/admin/product/ProductCreatePage'));
const AdminProductEditPage = lazy(() => import('../pages/admin/product/ProductEditPage'));
const AdminCategoryListPage = lazy(() => import('../pages/admin/category/CategoryListPage'));
const AdminCategoryCreatePage = lazy(() => import('../pages/admin/category/CategoryCreatePage'));
const AdminCategoryEditPage = lazy(() => import('../pages/admin/category/CategoryEditPage'));
const AdminOrderListPage = lazy(() => import('../pages/admin/order/OrderListPage'));
const AdminOrderDetailPage = lazy(() => import('../pages/admin/order/OrderDetailPage'));
const AdminUserListPage = lazy(() => import('../pages/admin/user/UserListPage'));
const AdminUserDetailPage = lazy(() => import('../pages/admin/user/UserDetailPage'));
const AdminVoucherListPage = lazy(() => import('../pages/admin/voucher/VoucherListPage'));
const AdminVoucherCreatePage = lazy(() => import('../pages/admin/voucher/VoucherCreatePage'));
const AdminVoucherEditPage = lazy(() => import('../pages/admin/voucher/VoucherEditPage'));
const AdminReviewListPage = lazy(() => import('../pages/admin/review/ReviewListPage'));

// Placeholder for future Voucher/Review pages
const ComingSoon = ({ title }) => (
  <div className="flex items-center justify-center h-96">
    <div className="text-center">
      <p className="text-4xl mb-4">🚧</p>
      <h2 className="text-xl font-black text-surface-200">{title}</h2>
      <p className="text-surface-500 mt-2 font-medium">Tính năng này sẽ sớm ra mắt.</p>
    </div>
  </div>
);

// System
const ForbiddenPage = lazy(() => import('../pages/system/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('../pages/system/ServerErrorPage'));


// Centralized Route Configuration
const routeConfig = [
  // 1. PUBLIC ROUTES (Main Shop)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "category/:slug", element: <CategoryPage /> },
      { path: "products", element: <ProductListPage /> },
      { path: "product/:id", element: <ProductDetailPage /> },
      { path: "search", element: <ProductSearchPage /> },
      
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      
      { path: "payment/success", element: <PaymentSuccessPage /> },
      { path: "payment/fail", element: <PaymentFailPage /> },
      { path: "wishlist", element: <WishlistPage /> },
      
      // Profile Dashboard (Centralized)
      {
        path: "profile",
        element: <ProtectedRoute allowedRoles={['admin', 'owner', 'user', 'customer']} />,
        children: [
          {
            element: <ProfileLayout />,
            children: [
              { index: true, element: <ProfileInfo /> },
              { path: "addresses", element: <AddressBook /> },
              { path: "orders", element: <OrderHistoryPage /> },
              { path: "orders/:id", element: <OrderDetailPage /> },
              { path: "vouchers", element: <VoucherWallet /> },
              { path: "change-password", element: <ChangePassword /> },
            ]
          }
        ]
      },
      // Other separate user routes if any
      {
        path: "user",
        element: <ProtectedRoute allowedRoles={['admin', 'owner', 'user', 'customer']} />,
        children: []
      }
    ]
  },

  // 2. AUTH ROUTES
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "verify-account", element: <VerifyAccountPage /> },
    ]
  },
  
  // Quick access Auth Routes
  { path: "/login", element: <AuthLayout />, children: [{ index: true, element: <LoginPage /> }] },
  { path: "/register", element: <AuthLayout />, children: [{ index: true, element: <RegisterPage /> }] },

  // 3. ADMIN ROUTES
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={['admin', 'owner']} />, 
    children: [
      { 
        path: "",
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          
          { path: "products", element: <AdminProductListPage /> },
          { path: "products/create", element: <AdminProductCreatePage /> },
          { path: "products/:id/edit", element: <AdminProductEditPage /> },
          
          { path: "categories", element: <AdminCategoryListPage /> },
          { path: "categories/create", element: <AdminCategoryCreatePage /> },
          { path: "categories/:id/edit", element: <AdminCategoryEditPage /> },
          
          { path: "orders", element: <AdminOrderListPage /> },
          { path: "orders/:id", element: <AdminOrderDetailPage /> },
          
          { path: "users", element: <AdminUserListPage /> },
          { path: "users/:id", element: <AdminUserDetailPage /> },
          
          { path: "vouchers", element: <AdminVoucherListPage /> },
          { path: "vouchers/create", element: <AdminVoucherCreatePage /> },
          { path: "vouchers/:id/edit", element: <AdminVoucherEditPage /> },
          
          { path: "reviews", element: <AdminReviewListPage /> },
        ]
      }
    ]
  },

  // 4. SYSTEM ROUTES
  { path: "/403", element: <ForbiddenPage /> },
  { path: "/500", element: <ServerErrorPage /> },

  // 5. NOT FOUND
  {
    path: "*",
    element: <NotFoundPage />
  }
];

const router = createBrowserRouter(routeConfig);

const AppRouter = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;

$basePath = "src/pages"
$dirs = @(
  "public", "public/category", "public/product",
  "auth", "user", "user/order", "payment",
  "admin", "admin/product", "admin/category", "admin/order", "admin/user", "admin/voucher", "admin/review",
  "system"
)

foreach ($dir in $dirs) {
  New-Item -ItemType Directory -Force -Path "$basePath/$dir"
}

$files = [ordered]@{
  "public/HomePage.jsx" = "HomePage";
  "public/NotFoundPage.jsx" = "NotFoundPage";
  "public/category/CategoryPage.jsx" = "CategoryPage";
  "public/product/ProductListPage.jsx" = "ProductListPage";
  "public/product/ProductDetailPage.jsx" = "ProductDetailPage";
  "public/product/ProductSearchPage.jsx" = "ProductSearchPage";
  "auth/LoginPage.jsx" = "LoginPage";
  "auth/RegisterPage.jsx" = "RegisterPage";
  "auth/ForgotPasswordPage.jsx" = "ForgotPasswordPage";
  "auth/ResetPasswordPage.jsx" = "ResetPasswordPage";
  "user/ProfilePage.jsx" = "ProfilePage";
  "user/AddressPage.jsx" = "AddressPage";
  "user/WishlistPage.jsx" = "WishlistPage";
  "user/CartPage.jsx" = "CartPage";
  "user/CheckoutPage.jsx" = "CheckoutPage";
  "user/order/OrderHistoryPage.jsx" = "OrderHistoryPage";
  "user/order/OrderDetailPage.jsx" = "UserOrderDetailPage";
  "payment/PaymentSuccessPage.jsx" = "PaymentSuccessPage";
  "payment/PaymentFailPage.jsx" = "PaymentFailPage";
  "admin/DashboardPage.jsx" = "DashboardPage";
  "admin/product/ProductListPage.jsx" = "AdminProductListPage";
  "admin/product/ProductCreatePage.jsx" = "AdminProductCreatePage";
  "admin/product/ProductEditPage.jsx" = "AdminProductEditPage";
  "admin/category/CategoryListPage.jsx" = "AdminCategoryListPage";
  "admin/category/CategoryCreatePage.jsx" = "AdminCategoryCreatePage";
  "admin/category/CategoryEditPage.jsx" = "AdminCategoryEditPage";
  "admin/order/OrderListPage.jsx" = "AdminOrderListPage";
  "admin/order/OrderDetailPage.jsx" = "AdminOrderDetailPage";
  "admin/user/UserListPage.jsx" = "AdminUserListPage";
  "admin/user/UserDetailPage.jsx" = "AdminUserDetailPage";
  "admin/voucher/VoucherListPage.jsx" = "VoucherListPage";
  "admin/voucher/VoucherCreatePage.jsx" = "VoucherCreatePage";
  "admin/voucher/VoucherEditPage.jsx" = "VoucherEditPage";
  "admin/review/ReviewListPage.jsx" = "ReviewListPage";
  "system/ForbiddenPage.jsx" = "ForbiddenPage";
  "system/ServerErrorPage.jsx" = "ServerErrorPage";
}

foreach ($item in $files.GetEnumerator()) {
  $path = "$basePath/" + $item.Name
  $name = $item.Value
  $content = "const $name = () => {`n  return (`n    <div className=`"p-6`">`n      <h1 className=`"text-2xl font-bold`">$name</h1>`n    </div>`n  );`n};`n`nexport default $name;"
  Set-Content -Path $path -Value $content
}

Remove-Item -Path "src/pages/Home.jsx" -ErrorAction SilentlyContinue
Remove-Item -Path "src/pages/Login.jsx" -ErrorAction SilentlyContinue
Remove-Item -Path "src/pages/AdminDashboard.jsx" -ErrorAction SilentlyContinue

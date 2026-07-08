import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    title: 'AtarLab — Luxury Attars & Perfumes',
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./features/catalog/product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Shop — AtarLab',
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./features/catalog/product-list/product-list.component').then((m) => m.ProductListComponent),
    title: 'Search — AtarLab',
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('./features/catalog/product-detail/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart-page.component').then((m) => m.CartPageComponent),
    title: 'Your Cart — AtarLab',
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/wishlist/wishlist-page.component').then((m) => m.WishlistPageComponent),
    canActivate: [authGuard],
    title: 'Wishlist — AtarLab',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout-page.component').then((m) => m.CheckoutPageComponent),
    canActivate: [authGuard],
    title: 'Checkout — AtarLab',
  },
  {
    path: 'checkout/success/:orderId',
    loadComponent: () =>
      import('./features/checkout/order-success.component').then((m) => m.OrderSuccessComponent),
    canActivate: [authGuard],
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Sign In — AtarLab',
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Create Account — AtarLab',
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/account-layout.component').then((m) => m.AccountLayoutComponent),
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/account/orders/order-list.component').then((m) => m.OrderListComponent),
        title: 'Your Orders — AtarLab',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/account/orders/order-detail.component').then((m) => m.OrderDetailComponent),
      },
      {
        path: 'addresses',
        loadComponent: () =>
          import('./features/account/addresses/address-list.component').then((m) => m.AddressListComponent),
        title: 'Your Addresses — AtarLab',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/account/profile/profile.component').then((m) => m.ProfileComponent),
        title: 'Account Settings — AtarLab',
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Admin Dashboard — AtarLab',
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/admin-product-list.component').then((m) => m.AdminProductListComponent),
        title: 'Manage Products — AtarLab',
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/admin/products/admin-product-form.component').then((m) => m.AdminProductFormComponent),
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./features/admin/products/admin-product-form.component').then((m) => m.AdminProductFormComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/categories/admin-category-list.component').then((m) => m.AdminCategoryListComponent),
        title: 'Manage Categories — AtarLab',
      },
      {
        path: 'brands',
        loadComponent: () =>
          import('./features/admin/brands/admin-brand-list.component').then((m) => m.AdminBrandListComponent),
        title: 'Manage Brands — AtarLab',
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./features/admin/banners/admin-banner-list.component').then((m) => m.AdminBannerListComponent),
        title: 'Manage Banners — AtarLab',
      },
      {
        path: 'coupons',
        loadComponent: () =>
          import('./features/admin/coupons/admin-coupon-list.component').then((m) => m.AdminCouponListComponent),
        title: 'Manage Coupons — AtarLab',
      },
      {
        path: 'offers',
        loadComponent: () =>
          import('./features/admin/offers/admin-offer-list.component').then((m) => m.AdminOfferListComponent),
        title: 'Manage Offers — AtarLab',
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/admin/inventory/admin-inventory-list.component').then((m) => m.AdminInventoryListComponent),
        title: 'Inventory — AtarLab',
      },
      {
        path: 'delivery-agents',
        loadComponent: () =>
          import('./features/admin/delivery-agents/admin-delivery-agent-list.component').then(
            (m) => m.AdminDeliveryAgentListComponent,
          ),
        title: 'Delivery Agents — AtarLab',
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/customers/admin-customer-list.component').then((m) => m.AdminCustomerListComponent),
        title: 'Customers — AtarLab',
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/admin/orders/admin-order-list.component').then((m) => m.AdminOrderListComponent),
        title: 'Manage Orders — AtarLab',
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/admin/orders/admin-order-detail.component').then((m) => m.AdminOrderDetailComponent),
      },
      {
        path: 'reviews',
        loadComponent: () =>
          import('./features/admin/reviews/admin-review-moderation.component').then(
            (m) => m.AdminReviewModerationComponent,
          ),
        title: 'Moderate Reviews — AtarLab',
      },
      {
        path: 'content',
        loadComponent: () =>
          import('./features/admin/content/admin-content.component').then((m) => m.AdminContentComponent),
        title: 'Content — AtarLab',
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/admin/reports/admin-reports.component').then((m) => m.AdminReportsComponent),
        title: 'Reports — AtarLab',
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./features/admin/roles/admin-role-list.component').then((m) => m.AdminRoleListComponent),
        title: 'Roles & Permissions — AtarLab',
      },
      {
        path: 'activity-logs',
        loadComponent: () =>
          import('./features/admin/activity-logs/admin-activity-log-list.component').then(
            (m) => m.AdminActivityLogListComponent,
          ),
        title: 'Activity Logs — AtarLab',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/settings/admin-settings.component').then((m) => m.AdminSettingsComponent),
        title: 'Settings — AtarLab',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

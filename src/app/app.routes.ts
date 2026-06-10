import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('@pages/products-list/products-list').then((m) => m.ProductsList),
  },
  {
    path: 'login', // url http://localhost:5000/#/login
    loadComponent: () =>
      import('@pages/auth/login-component/login-component').then((m) => m.LoginComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('@pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'payment-result',
    loadComponent: () =>
      import('@pages/payment-result/payment-result').then((m) => m.PaymentResult),
  },
  {
    path: 'product-detail/:id',
    loadComponent: () =>
      import('@pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'admin',
    loadChildren: () => import('@pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES), // url: http://localhost:5000/#/admin
    canActivate: [authGuard],
  },
];

import { Routes } from '@angular/router';
import { ProductsList } from './pages/products-list/products-list';
import { PaymentResult } from './pages/payment-result/payment-result';
import { ProductDetail } from './pages/product-detail/product-detail';

import { authGuard } from './shared/guards/auth.guard';
import { ProductFormAdmin } from './pages/admin/product-form-admin/product-form-admin/product-form-admin';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ProductsList,
  },
  {
    path: 'login', // url http://localhost:5000/#/login
    loadComponent: () =>
      import('./pages/auth/login-component/login-component').then((m) => m.LoginComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  { path: 'payment-result', component: PaymentResult },
  { path: 'product-detail/:id', component: ProductDetail },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES), // tipiar url: http://localhost:5000/#/admin
    canActivate: [authGuard],
  },
  { path: 'product/create', component: ProductFormAdmin, data: { operation: 'create' } },
  { path: 'product/edit/:id', component: ProductFormAdmin, data: { operation: 'edit' } },
];

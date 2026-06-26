import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { redirectIfAuthenticatedGuard } from '@core/guards/redirect-If-authenticated.guard';
import { unsavedChangesGuard } from '@core/guards/unsaved-changes.guard';

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
    canActivate: [redirectIfAuthenticatedGuard], // leer documentation/redirect-if-authenticated.guard.md
  },
  {
    path: 'cart',
    loadComponent: () => import('@pages/cart/cart').then((m) => m.Cart),
    // canDeactivate: Se ejecuta antes de abandonar una ruta actual para ir a otra
    canDeactivate: [unsavedChangesGuard], // leer documentation/CanDeactivate-guard.md
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
    // canActivate: Se ejecuta antes de navegar a una ruta
    canActivate: [authGuard], // Solo rol administrador puede acceder a las rutas hijas de /admin
  },
];

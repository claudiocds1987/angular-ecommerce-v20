import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', // /admin
    loadComponent: () =>
      import('@pages/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    title: 'Panel de Administración',
  },
  {
    path: 'products-grid-admin', // /admin/products-grid-admin
    loadComponent: () =>
      import('@pages/admin/products-grid-admin/products-grid-admin').then(
        (m) => m.ProductsGridAdmin,
      ),
    title: 'Lista de Productos',
  },
  {
    path: 'product-extra-attribute-definition', // /admin/product-extra-attribute-definition
    loadComponent: () =>
      import('@pages/admin/product-extra-attribute-definition/product-extra-attribute-definition').then(
        (m) => m.ProductExtraAttributeDefinition,
      ),
    title: 'Definición de Atributos Extra para el producto',
  },
];

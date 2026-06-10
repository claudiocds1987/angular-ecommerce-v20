import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', // URL: /admin
    loadComponent: () =>
      import('@pages/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    title: 'Panel de Administración',
  },
  {
    path: 'products-grid-admin', // URL: /admin/products-grid-admin
    loadComponent: () =>
      import('@pages/admin/products-grid-admin/products-grid-admin').then(
        (m) => m.ProductsGridAdmin,
      ),
    title: 'Lista de Productos',
  },
  {
    path: 'product-extra-attribute-definition', // URL: /admin/product-extra-attribute-definition
    loadComponent: () =>
      import('@pages/admin/product-extra-attribute-definition/product-extra-attribute-definition').then(
        (m) => m.ProductExtraAttributeDefinition,
      ),
    title: 'Definición de Atributos Extra',
  },
  {
    path: 'product/create', // URL real: /admin/product/create
    loadComponent: () =>
      import('@pages/admin/product-form-admin/product-form-admin/product-form-admin').then(
        (m) => m.ProductFormAdmin,
      ),
    data: { operation: 'create' },
    title: 'Crear Producto',
  },
  {
    path: 'product/edit/:id', // URL real: /admin/product/edit/:id
    loadComponent: () =>
      import('@pages/admin/product-form-admin/product-form-admin/product-form-admin').then(
        (m) => m.ProductFormAdmin,
      ),
    data: { operation: 'edit' },
    title: 'Editar Producto',
  },
];

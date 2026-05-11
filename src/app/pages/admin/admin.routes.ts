import { Routes } from '@angular/router';
import { ProductsGridAdmin } from './products-grid-admin/products-grid-admin';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { ProductExtraAttributeDefinition } from './product-extra-attribute-definition/product-extra-attribute-definition';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', // admin
    component: AdminDashboard,
    title: 'Panel de Administración',
  },
  {
    path: 'products-grid-admin', // Esto cargará cuando entres a /admin
    component: ProductsGridAdmin,
    title: 'Lista de Productos',
  },
  {
    path: 'product-extra-attribute-definition', // Esto cargará cuando entres a /admin
    component: ProductExtraAttributeDefinition,
    title: 'Definición de Atributos Extra para el producto',
  },
];

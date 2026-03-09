import { Routes } from '@angular/router';
import { ProductsGridAdmin } from './products-grid-admin/products-grid-admin';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', // Esto cargará cuando entres a /admin
    component: ProductsGridAdmin,
    title: 'Panel de Administración',
  },
  // Para"crear producto":
  // { path: 'create', component: CreateProductAdminComponent }
];

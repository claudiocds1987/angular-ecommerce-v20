import { Routes } from '@angular/router';
import { ProductsList } from './pages/products-list/products-list';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: ProductsList
     /*    loadComponent: () =>
            import('./pages/products-list/products-list').then((m) => m.ProductsList), */
    },
    {
        path: 'cart',
        loadComponent: () =>
            import('./pages/cart/cart').then((m) => m.Cart),
    },
    
];

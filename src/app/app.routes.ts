import { Routes } from '@angular/router';
import { ProductsList } from './pages/products-list/products-list';
import { PaymentResult } from './pages/payment-result/payment-result';

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
    { path: 'payment-result', component: PaymentResult },
    
];

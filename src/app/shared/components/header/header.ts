import { Component, inject, signal } from '@angular/core';
import { PrimaryButton } from '../primary-button/primary-button';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-header',
    imports: [PrimaryButton],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    title = signal<string>('Angular Ecommerce-v20');

    cartService = inject(CartService); 
    private _router = inject(Router);

    redirectToCart() {
      
        this._router.navigate(['/cart']);
    }

    redirectToHomePage() {
        this._router.navigate(['/']);
    }
}

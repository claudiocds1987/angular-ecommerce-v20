import { Component, inject, input, signal } from '@angular/core';
import { Product } from '../../../shared/models/product.model';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartService } from '../../../shared/services/cart-service';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [PrimaryButton],
    templateUrl: './product-card.html',
    styleUrl: './product-card.scss',
})
export class ProductCard {
    product = input.required<Product>();
    cartService = inject(CartService);

    addToCart(product: Product) {
        this.cartService.addToCart(this.product());
        console.log(`Producto ${this.product().title} agregado al carrito.`);
    }
}

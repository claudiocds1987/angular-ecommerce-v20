import { Component, inject, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importación necesaria
import { Product } from '../../../shared/models/product.model';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartService } from '../../../shared/services/cart-service';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [PrimaryButton, CommonModule, CurrencyPipe, RouterLink],
    templateUrl: './product-card.html',
    styleUrl: './product-card.scss',
})
export class ProductCard {
    product = input.required<Product>();
    cartService = inject(CartService);
    private _router = inject(Router);

    addToCart(product: Product) {
        const isProductRepeated = this.cartService.checkItemsRepeated(product.id);
        if (isProductRepeated) {
            alert('Este producto ya está en el carrito.');
            return;
        }
        this.cartService.addToCart(product);
    }

   /*  goToDetail(): void {
        const id = this.product().id;
        this._router.navigate(['/product-detail', id]);
    } */
   // Dentro de tu clase ProductCardComponent

handleNavigate(event: MouseEvent): void {
  // 1. Evitamos que el navegador recargue la página completa
  event.preventDefault();
  
  // 2. Usamos el router de Angular para una navegación interna suave
  this._router.navigate(['/product-detail', this.product().id]);
}
}

import { Component, inject, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importación necesaria
import { Product } from '../../../shared/models/product.model';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartService } from '../../../shared/services/cart-service';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetail } from '../../product-detail/product-detail';

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
    private _matDialog = inject(MatDialog);

    addToCart(product: Product) {
        const isProductRepeated = this.cartService.checkItemsRepeated(product.id);
        if (isProductRepeated) {
            alert('Este producto ya está en el carrito.');
            return;
        }
        this.cartService.addToCart(product);
    }

   
    openDetailModal(): void {
        this._matDialog.open(ProductDetail, {
            data: this.product(), // Enviamos el producto al componente ProductDetail
            width: '1000px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            autoFocus: false,
            backdropClass: 'custom-modal-backdrop' // Esta clase esta definida en styles.scss para que elefecto desenfoque funcione en todo el body
        });
    }
}

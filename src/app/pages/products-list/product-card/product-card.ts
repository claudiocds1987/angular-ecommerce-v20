import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importación necesaria
import { Product } from '../../../shared/models/product.model';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';
import { CartService } from '../../../shared/services/cart-service';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetail } from '../../product-detail/product-detail';
import { ToastService } from '../../../shared/services/toast-service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [PrimaryButton, CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<Product>();
  cartService = inject(CartService);

  private _toastService = inject(ToastService);
  private _matDialog = inject(MatDialog);

  addToCart(product: Product) {
    const isProductRepeated = this.cartService.checkItemsRepeated(product.id);
    if (isProductRepeated) {
      this._toastService.show(`El producto ya esta en el carrito`, 'warning');
      return;
    }
    this.cartService.addToCart(product);
    this._toastService.show(`El producto se agregó al carrito`, 'success');
  }

  openDetailModal(): void {
    this._matDialog.open(ProductDetail, {
      data: this.product(), // Enviamos el producto al componente ProductDetail
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      backdropClass: 'custom-modal-backdrop', // Esta clase esta definida en styles.scss para que elefecto desenfoque funcione en todo el body
    });
  }
}

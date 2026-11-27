import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '@features/products/models/product.model';
import { Button } from '@shared/components/button/button';
import { CartService } from '@features/checkout/services/cart-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [Button, CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  product = input.required<Product>();
  cartService = inject(CartService);
  viewDetail = output<number>();
  addToCart = output<Product>();

  onAddToCart(): void {
    this.addToCart.emit(this.product());
  }

  onViewDetail(): void {
    this.viewDetail.emit(this.product().id);
  }
}

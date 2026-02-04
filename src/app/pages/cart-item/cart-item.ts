import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { CartItem } from '../../shared/models/product.model';
import { CartService } from '../../shared/services/cart-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-item',
  imports: [CommonModule],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartItemComponent {
  item = input.required<CartItem>();

  cartService = inject(CartService);

  @ViewChild('inputQuantity') inputQuantity!: ElementRef<HTMLInputElement>;

  onRemoveItem(itemId: number) {
    this.cartService.removeFromCart(itemId);
  }

  onQuantityChange(productId: number, value: string) {
    let quantity = parseInt(value);
    const maxStock = this.item().stock;

    // 1. Validar si el usuario borró el número o escribió algo raro
    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
    }
    // 2. Validar que no supere el stock máximo
    else if (quantity > maxStock) {
      quantity = maxStock;
    }

    // 3. Actualizar el valor visualmente en el input (por si el usuario escribió 999)
    if (this.inputQuantity && this.inputQuantity.nativeElement) {
      this.inputQuantity.nativeElement.value = quantity.toString();
    }

    // 4. Llamar al servicio para actualizar el carrito
    this.cartService.updateQuantity(productId, quantity);
  }
}

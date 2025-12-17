import { Component, inject, input } from '@angular/core';
import { Product } from '../../shared/models/product.model';
import { CartService } from '../../shared/services/cart-service';

@Component({
  selector: 'app-cart-item',
  imports: [],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.scss',
})
export class CartItem {

  item = input.required<Product>();

  cartService = inject(CartService);

  onRemoveItem(itemId: number) {
    this.cartService.removeFromCart(itemId);
  }

  onQuantityChange(productId:number, quantity:any) {
    //this.cartService.updateItemQuantity(this.item.id, newQuantity);
    //this.cartService.addToCart(product);
  }

}

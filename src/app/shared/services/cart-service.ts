import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {

  cart = signal<Product[]>([]);

  addToCart(product: Product) {
    this.cart.update((currentCart) => [...currentCart, product]);
    //this.cart.set([...this.cart(), product]);
  }

  removeFromCart(productId: number) {
    this.cart.update((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }
  
}

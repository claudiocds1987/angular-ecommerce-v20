import { computed, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({
    providedIn: 'root',
})
export class CartService {
   /*  cart = signal<Product[]>([]);

    addToCart(product: Product) {
        this.cart.update((currentCart) => [...currentCart, product]);
        //this.cart.set([...this.cart(), product]);
    }

    removeFromCart(productId: number) {
        this.cart.update((currentCart) => currentCart.filter((item) => item.id !== productId));
    }

    checkItemsRepeated(productId: number): boolean {
        return this.cart().some((item) => item.id === productId);
    } */


  //     lo siguiente dejarlo aca  
  // la funcion deberia recorrer cart preguntar por el id y multiplicar por la cantidad ese precio
      cart = signal<CartItem[]>([]);

  // El precio total es automático, siempre estará sincronizado
  totalPrice = computed(() => 
    this.cart().reduce((total, item) => total + (item.price * item.quantity), 0)
  );

  addToCart(product: Product) {
    this.cart.update((currentCart) => {
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si ya existe, aumentamos cantidad
        return currentCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Si es nuevo, lo agregamos con cantidad 1
      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  updateQuantity(productId: number, quantity: number) {
    this.cart.update((currentCart) =>
      currentCart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
      )
    );
  }

  removeFromCart(productId: number) {
    this.cart.update((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  checkItemsRepeated(productId: number): boolean {
        return this.cart().some((item) => item.id === productId);
    }
}

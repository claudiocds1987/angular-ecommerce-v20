import { computed, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    cart = signal<CartItem[]>([]);
    // El precio total es automático, siempre estará sincronizado con computed
    totalPrice = computed(() =>
        this.cart().reduce((total, item) => total + (item.finalPrice ?? item.price) * item.quantity, 0),
    );

    addToCart(product: Product) {
        this.cart.update((currentCart) => {
            const existingItem = currentCart.find((item) => item.id === product.id);

            if (existingItem) {
                // Si ya existe, aumentamos cantidad
                return currentCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
                );
            }
            // Si es nuevo, lo agregamos con cantidad 1
            return [...currentCart, { ...product, quantity: 1 }];
        });
    }

    updateQuantity(productId: number, quantity: number) {
        this.cart.update((currentCart) =>
            currentCart.map((item) =>                     // Math.max para evitar cantidades negativas
                item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item,
            ),
        );
    }

    removeFromCart(productId: number) {
        this.cart.update((currentCart) => currentCart.filter((item) => item.id !== productId));
    }

    checkItemsRepeated(productId: number): boolean {
        return this.cart().some((item) => item.id === productId);
    }
}

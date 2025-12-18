import { Component, computed, inject } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from "../../../shared/components/primary-button/primary-button";

@Component({
  selector: 'app-order-summary',
  imports: [PrimaryButton],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummary {

  cartService = inject(CartService);

  total = this.cartService.totalPrice;

  /* total = computed(() => {
    //return this.cartService.cart().reduce((sum, item) => sum + item.price, 0);
    let total = 0;
    for (const item of this.cartService.cart()) {
      total += item.price;
    }
    return total;
  }); */
}

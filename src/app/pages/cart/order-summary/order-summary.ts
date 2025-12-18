import { Component, computed, inject } from '@angular/core';
import { CartService } from '../../../shared/services/cart-service';
import { PrimaryButton } from '../../../shared/components/primary-button/primary-button';

@Component({
    selector: 'app-order-summary',
    imports: [PrimaryButton],
    templateUrl: './order-summary.html',
    styleUrl: './order-summary.scss',
})
export class OrderSummary {
    cartService = inject(CartService);
    total = this.cartService.totalPrice;

}

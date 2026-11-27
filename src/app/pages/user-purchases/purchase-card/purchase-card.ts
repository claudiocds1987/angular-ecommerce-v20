import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MyPurchaseItem } from '@features/purchases/models/purchase.model';

@Component({
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CurrencyPipe, DatePipe],
  selector: 'app-purchase-card',
  styleUrl: './purchase-card.scss',
  templateUrl: './purchase-card.html',
})
export class PurchaseCard {
  item = input.required<MyPurchaseItem>();
  buyAgain = output<number>();

  onBuyAgain(event: Event): void {
    // Evita que se dispare el (click) de la mat-card que lleva al detalle del producto
    event.stopPropagation();
    this.buyAgain.emit(this.item().productId);
  }
}

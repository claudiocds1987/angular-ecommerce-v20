import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ProductStore } from '../state/product.store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products-grid-admin',
  standalone: true,
  imports: [CommonModule], // CommonModule para usar @if, @for, etc.
  templateUrl: './products-grid-admin.html',
  styleUrl: './products-grid-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridAdmin implements OnInit {
  // Inyeccón del Store product.store que creado con NgRX Signals
  readonly store = inject(ProductStore);

  ngOnInit() {
    // Disparamos la carga inicial de productos desde la API
    this.store.loadAllProducts();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    // Actualizamos la query en el store; esto disparará el computed automáticamente
    this.store.searchProducts(input.value);
  }
}

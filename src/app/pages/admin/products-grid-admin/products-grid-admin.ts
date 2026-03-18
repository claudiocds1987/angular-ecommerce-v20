import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ProductStore } from '../state/product.store';
import { CommonModule } from '@angular/common';
import { ExcelUpload } from '../../../shared/components/excel-upload/excel-upload';
import { ImportResultResponse } from '../../../shared/models/import-result-response.model';

@Component({
  selector: 'app-products-grid-admin',
  standalone: true,
  imports: [CommonModule, ExcelUpload], // CommonModule para usar @if, @for, etc.
  templateUrl: './products-grid-admin.html',
  styleUrl: './products-grid-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridAdmin implements OnInit {
  // Inyeccón del Store product.store que creado con NgRX Signals
  readonly store = inject(ProductStore);
  importErrors = signal<string[]>([]);

  ngOnInit() {
    // Disparamos la carga inicial de productos desde la API
    this.store.loadAllProducts();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    // Actualizamos la query en el store; esto disparará el computed automáticamente
    this.store.searchProducts(input.value);
  }

  handleImportSuccess(response: ImportResultResponse) {
    // 1. Limpiamos errores previos
    this.importErrors.set([]);

    // 2. Notificamos éxito (puedes usar un Toast/SnackBar)
    alert(`${response.message} (${response.count} productos procesados)`);

    // 3. RECUALGAMOS LA GRILLA
    // Dependiendo de cómo funcione tu store, deberías llamar al método de carga:
    this.store.loadAllProducts();
  }

  handleImportErrors(errors: string[]) {
    // Seteamos la lista de errores para que se vea en el HTML
    this.importErrors.set(errors);
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ProductStore } from '../state/product.store';
import { CommonModule } from '@angular/common';
import { ExcelUpload } from '../../../shared/components/excel-upload/excel-upload';
import { ImportResultResponse } from '../../../shared/models/import-result-response.model';
import { ExcelService } from '../../../shared/services/excel-service';
import { HttpErrorResponse } from '@angular/common/http';
import { RawImportResponse } from '../../../shared/models/row-import-response.model';

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

  private _excelService = inject(ExcelService);
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
    console.log('Respuesta real recibida:', response);
    this.importErrors.set([]); // Limpiamos errores previos
    this.store.loadAllProducts(); // Recargamos la grilla
    alert(`${response.Message}\nTotal: ${response.Count} productos.`);
  }

  handleImportErrors(errorMessages: string[]): void {
    this.importErrors.set(errorMessages);
  }

  onDownloadErrors(): void {
    this._excelService.downloadErrorReport(this.importErrors(), 'errores_productos');
  }
}

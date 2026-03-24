import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ProductStore } from '../state/product.store';
import { CommonModule } from '@angular/common';
import { ExcelUpload } from '../../../shared/components/excel-upload/excel-upload';
import { ImportResultResponse } from '../../../shared/models/import-result-response.model';
import { ExcelService } from '../../../shared/services/excel-service';

import { environment } from '../../../../environments/environment';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';

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
  apiURL = `${environment.serverUrl}/api/import/products`;

  private _excelService = inject(ExcelService);

  ngOnInit() {
    //this.store.searchProducts({ query: '', page: 1, size: 50 });
    // Carga inicial de productos del store para mostrar en la grilla
    //this.store.loadAllProducts();
    this._loadData();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this._loadData(input.value);
  }

  handleImportSuccess(response: ImportResultResponse) {
    this.importErrors.set([]); // Limpieza errores previos
    this._loadData();
    alert(`${response.Message}\nTotal: ${response.Count} productos.`);
  }

  handleImportErrors(errorMessages: string[]): void {
    this.importErrors.set(errorMessages);
  }

  onDownloadErrors(): void {
    this._excelService.downloadErrorReport(this.importErrors(), 'errores_productos');
  }

  private _loadData(query = '') {
    this.store.searchProducts({
      filters: {
        search: query,
        category: '',
        minPrice: null,
        maxPrice: null,
        sortBy: 'title',
        order: 'asc',
      } as ProductFilterData,
      page: 1,
      size: 30,
    });
  }
}

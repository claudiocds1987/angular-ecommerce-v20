import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ProductStore } from '../state/product.store';
import { CommonModule } from '@angular/common';
import { ExcelUpload } from '../../../shared/components/excel-upload/excel-upload';
import { ImportResultResponse } from '../../../shared/models/import-result-response.model';
import { ExcelService } from '../../../shared/services/excel-service';

import { environment } from '../../../../environments/environment';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';
import { ProductAdminStore } from '../state/product-admin.store';

@Component({
  selector: 'app-products-grid-admin',
  standalone: true,
  imports: [CommonModule, ExcelUpload], // CommonModule para usar @if, @for, etc.
  templateUrl: './products-grid-admin.html',
  styleUrl: './products-grid-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridAdmin implements OnInit {
  // Inyeccón del Store product-admin.store que creado con NgRX Signals
  readonly productAdminStore = inject(ProductAdminStore);
  importErrors = signal<string[]>([]);
  apiURL = `${environment.serverUrl}/api/import/products`;

  private _excelService = inject(ExcelService);

  ngOnInit() {
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
    // Para GraphQL, "page 1" es simplemente no enviar el parámetro 'after'
    this.productAdminStore.loadProducts({
      search: query,
      first: 25, // 'First' es la cantidad de registros a cargar por pagina
      // No enviamos 'after' para que siempre resetee a la primera página en cada búsqueda
    });
  }

  loadMore() {
    if (this.productAdminStore.hasNextPage()) {
      this.productAdminStore.loadProducts({
        search: this.productAdminStore.filterQuery(),
        first: 30,
        after: this.productAdminStore.endCursor(), // Aquí es donde GraphQL sabe dónde quedó
      });
    }
  }
}

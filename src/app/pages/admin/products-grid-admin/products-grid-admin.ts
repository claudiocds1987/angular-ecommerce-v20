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
    this.importErrors.set([]); // Limpiamos errores previos
    this.store.loadAllProducts(); // Recargamos la grilla
    alert(response.message);
  }

  handleImportErrors(error: any): void {
    // 1. Si es un array directo (caso raro)
    if (Array.isArray(error)) {
      this.importErrors.set(error);
      return;
    }

    // 2. Extraer el cuerpo (Response de Network)
    // En Angular, el JSON del servidor está en error.error
    const apiResponse = error.error;

    // 3. Buscar la lista de errores (Probamos PascalCase y camelCase)

    const listaDetallada = apiResponse?.Errors || apiResponse?.errors;
    const mensajeGeneral = apiResponse?.Message || apiResponse?.message || error.message;

    if (listaDetallada && Array.isArray(listaDetallada) && listaDetallada.length > 0) {
      // ESTO ES LO QUE QUEREMOS: "Fila 95: La BrandId..."
      this.importErrors.set(listaDetallada);
    } else {
      // Si la API no mandó lista, guardamos el mensaje de error
      this.importErrors.set([mensajeGeneral || 'Error desconocido al procesar el archivo']);
    }
  }

  onDownloadErrors(): void {
    // Reutilizamos la lógica del servicio
    this._excelService.downloadErrorReport(this.importErrors(), 'errores_productos');
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ExcelUpload } from '../../../shared/components/excel-upload/excel-upload';
import { ImportResultResponse } from '../../../shared/models/import-result-response.model';
import { ExcelService } from '../../../shared/services/excel-service';

import { environment } from '../../../../environments/environment';

import { ProductAdminStore } from '../state/product-admin.store';
import {
  createDefaultGridConfiguration,
  GridConfiguration,
  GridData,
  PaginationConfig,
} from '../../../shared/models/grid-configuration.model';
import { Product } from '../../../shared/models/product.model';
import { ProductFilterParams } from '../../../shared/models/product-filter-params.model';
import { GridFilterConfig } from '../../../shared/models/grid-filter-configuration.model';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { Chip } from '../../../shared/components/chips/chips.component';
import { ProductCategory } from '../../../shared/models/product-category.model';

@Component({
  selector: 'app-products-grid-admin',
  standalone: true,
  imports: [CommonModule, ExcelUpload], // CommonModule para usar @if, @for, etc.
  templateUrl: './products-grid-admin.html',
  styleUrl: './products-grid-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridAdmin implements OnInit {
  gridFilterConfigSig = signal<GridFilterConfig[]>([]);
  gridFilterFormSig = signal<FormGroup>(new FormGroup({}));
  gridConfigSig = signal<GridConfiguration>({} as GridConfiguration);
  gridDataSig = signal<GridData[]>([]);
  chipsSig = signal<Chip[]>([]);
  // Inyeccón del Store product-admin.store que creado con NgRX Signals
  readonly productAdminStore = inject(ProductAdminStore);
  importErrors = signal<string[]>([]);
  apiURL = `${environment.serverUrl}/api/import/products`;

  private _productFilterParams: ProductFilterParams = {};
  private _categories: ProductCategory[] = [];

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

  loadMore() {
    if (this.productAdminStore.hasNextPage()) {
      this.productAdminStore.loadProducts({
        search: this.productAdminStore.filterQuery(),
        first: 30,
        after: this.productAdminStore.endCursor(), // Aquí es donde GraphQL sabe dónde quedó
      });
    }
  }

  private _loadData(query = '') {
    // Para GraphQL, "page 1" es simplemente no enviar el parámetro 'after'
    this.productAdminStore.loadProducts({
      search: query,
      first: 25, // 'First' es la cantidad de registros a cargar por pagina
      // No enviamos 'after' para que siempre resetee a la primera página en cada búsqueda
    });
  }

  private _defaultChips = {
    categoria: 'all',
    marca: 'all',
    active: 'all',
  };

  private _defaultPaginatorOptions: PaginationConfig = {
    pageIndex: 0,
    pageSize: 25,
    pageSizeOptions: [5, 10, 25, 100],
    totalCount: 0,
    isServerSide: true,
  };

  private _setEmployeeFilterParameters(): void {
    this._productFilterParams = {};
    this._productFilterParams.page = 1;
    this._productFilterParams.limit = 25;
    this._productFilterParams.sortColumn = 'id';
    this._productFilterParams.sortOrder = 'asc';
  }

  private _setGridConfiguration(): GridConfiguration {
    const config = createDefaultGridConfiguration({
      columns: [
        {
          name: 'id',
          width: '100px',
          isSortable: true,
        },
        {
          name: 'imgUrl',
          width: '100px',
          type: 'img',
          isSortable: false,
          hasHeader: false,
        },
        {
          name: 'titulo',
          width: '200px' /*headerTooltip: "nombre completo"*/,
        },
        {
          name: 'precio',
          width: '200px' /*style: "font-weight: bold;"*/,
        },
        {
          name: 'descuento',
          width: '100px' /*style: "font-weight: bold;"*/,
        },
        {
          name: 'precio/final',
          width: '100px' /*style: "font-weight: bold;"*/,
        },
        { name: 'sku' },
        { name: 'stock', isSortable: false }, // false por que ordenaria por id no alfabeticamente
        { name: 'categoria', isSortable: false }, // false por que ordenaria por id no alfabeticamente
        { name: 'marca', isSortable: false }, // false por que ordenaria por id no alfabeticamente
        {
          name: 'active',
          //headerIcon: "/assets/person.svg", si el nombre de la columna aparece cortado darle mas width
          class: 'status-circle',
          align: 'center',
          width: '75px',
        },

        {
          name: 'elipsisActions',
          width: '100px',
          align: 'center',
          isSortable: false,
          type: 'elipsis',
          hasHeader: false,
        },
      ],
      paginator: {
        pageSize: this._productFilterParams.limit || 25,
        pageSizeOptions: [25, 50],
        totalCount: 0,
        pageIndex: 0,
        isServerSide: true,
      },
      hasSorting: { isServerSide: true },
      OrderBy: {
        columnName: this._productFilterParams.sortColumn || 'id',
        direction: (this._productFilterParams.sortOrder || 'asc') as 'asc' | 'desc',
      },
      hasChips: true,
      actionButtons: [
        {
          class: 'primary-button',
          icon: 'assets/person.svg',
          text: 'Agregar',
          //action: (): void => this.onCreateEmployee(),
        },
        {
          class: 'download-button',
          type: 'download',
          icon: 'assets/download.svg',
          tooltip: 'Descargar excel',
        },
      ],
    });
    return config;
  }

  private _initializeGridFilter(): void {
    // 1. DEFINICIÓN DE LA CONFIGURACIÓN PARA COMPONENTE GRID-FILTER
    const config: GridFilterConfig[] = [
      { fieldName: 'id', fieldType: 'text', label: 'Id' },
      { fieldName: 'title', fieldType: 'text', label: 'Título' },
      { fieldName: 'category', fieldType: 'text', label: 'Categoría' },
      { fieldName: 'brand', fieldType: 'text', label: 'Marca' },
      {
        fieldName: 'categoryId',
        fieldType: 'select',
        label: 'Categoría',
        //selectItems: this._genders,
      },
      {
        fieldName: 'brandId',
        fieldType: 'select',
        label: 'Marca',
        //selectItems: this._brands,
      },
      /* {
        fieldName: 'active',
        fieldType: 'select',
        label: 'Estado',
        selectItems: [
          { description: 'Todos', id: 'all' },
          { description: 'activo', id: 1 },
          { description: 'inactivo', id: 0 },
        ],
      }, */
    ];

    // 2. ACTUALIZA SIGNAL DE CONFIGURACIÓN
    this.gridFilterConfigSig.set(config);

    // 3. CREACIÓN DINÁMICA DE CONTROLES PARA EL FORMULARIO
    const formControls: Record<string, FormGroup | FormControl | AbstractControl> = {};

    config.forEach((filter: GridFilterConfig): void => {
      switch (filter.fieldType) {
        case 'text':
          // Inicializa campos de texto con cadena vacía
          formControls[filter.fieldName] = new FormControl('');
          break;

        case 'select':
          // Inicializa campos de selección con "all" (o null/'' si aplica)
          formControls[filter.fieldName] = new FormControl('all');
          break;

        case 'dateRangeComponent':
          // Inicializa grupos de rango de fechas
          formControls[filter.fieldName] = new FormGroup({
            startDate: new FormControl(null),
            endDate: new FormControl(null),
          });
          break;
      }
    });

    // ACTUALIZA SIGNAL DEL FORMULARIO
    this.gridFilterFormSig.set(new FormGroup(formControls));
  }
}

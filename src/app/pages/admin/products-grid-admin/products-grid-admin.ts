import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';

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
import { GridComponent } from '../../../shared/components/grid/grid.component';
import { GridFilterComponent } from '../../../shared/components/grid/grid-filter/grid-filter.component';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { SpinnerService } from '../../../shared/services/spinner-service';
import { ProductService } from '../../../shared/services/product-service';
import { first, map } from 'rxjs';
import { ExportService } from '../../../shared/services/export-service';
import { CategoryStore } from '../state/category.store';
import { BrandStore } from '../state/brand.store';
import { ProductBrand } from '../../../shared/models/product-brand.model';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';
import { ProductAdminGrid } from '../../../shared/models/product-admin-grid.model';
import { ProductGraphqlService } from '../../../shared/services/product-graphql-service';

@Component({
  selector: 'app-products-grid-admin',
  standalone: true,
  imports: [CommonModule, ExcelUpload, GridComponent, GridFilterComponent], // CommonModule para usar @if, @for, etc.
  templateUrl: './products-grid-admin.html',
  styleUrl: './products-grid-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsGridAdmin implements OnInit {
  gridFilterConfigSig = signal<GridFilterConfig[]>([]);
  //gridFilterFormSig = signal(this._createFilterGridForm());
  gridFilterFormSig = signal<FormGroup>(new FormGroup({}));
  gridConfigSig = signal<GridConfiguration>({} as GridConfiguration);
  gridDataSig = signal<GridData[]>([]);
  chipsSig = signal<Chip[]>([]);
  isFilterCollapsedSig = signal<boolean>(false);
  // Inyeccón del Store product-admin.store que creado con NgRX Signals
  readonly productAdminStore = inject(ProductAdminStore);
  readonly categoryStore = inject(CategoryStore);
  readonly brandStore = inject(BrandStore);
  importErrors = signal<string[]>([]);
  apiURL = `${environment.serverUrl}/api/import/products`;

  private _productFilterParams: ProductFilterParams = {};
  //private _categories: ProductCategory[] = [];

  private _excelService = inject(ExcelService);
  private _spinnerService = inject(SpinnerService);
  private _productServices = inject(ProductService);
  private _exportService = inject(ExportService);
  private _graphqlService = inject(ProductGraphqlService);
  private _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // Mapeo reactivo: Transforma la data del Store al formato de las columnas de tu Grid
  mappedProductsSig = computed<GridData[]>(() => {
    const products = this.productAdminStore.items();

    return products.map((product) => {
      // Aseguramos que el ID sea un número para que coincida con el tipado del componente
      const productId = Number(product.id);

      return {
        id: productId,
        imgUrl: product.thumbnail,
        title: product.title,
        price: product.price,
        discountPercentage: product.discountPercentage,
        finalPrice: product.finalPrice,
        sku: product.sku,
        stock: product.stock,
        categoryId: product.categoryName || 'N/A',
        brandId: product.brandName || 'N/A',
        isActive: product.isActive,
        elipsisActions: [
          {
            label: 'Editar',
            icon: 'edit',
            // Cambiamos el parámetro a number para que no proteste el ElipsisAction
            action: (id: number) => console.log('Edit', id),
          },
          {
            label: 'Eliminar',
            icon: 'delete',
            action: (id: number) => console.log('Delete', id),
          },
        ],
      } as GridData; // Forzamos el cast a GridData para evitar problemas de firma de índice
    });
  });

  // Paginación reactiva: Mezcla la config base con el total del store
  gridConfigWithTotalSig = computed(() => {
    const config = this.gridConfigSig();
    if (!config.paginator) return config;
    return {
      ...config,
      paginator: {
        ...config.paginator,
        totalCount: this.productAdminStore.totalItems(),
      },
    };
  });

  constructor() {
    this.gridConfigSig.set(this._setGridConfiguration());
    // ¿por qué lo hago asi?, effect es "observador reactivo" (sensor) que queda a la espera:
    // se activa en el constructor pero se re-ejecuta automáticamente cada vez que
    // los items de los Stores cambian (cuando loadAll() en ngOnInit recibe la respuesta de la API).
    // al principio el effect se ejecuta con los arrays categories y brands vacíos, pero una vez que las categorías y marcas se cargan en los Stores,
    // el effect detecta el cambio y vuelve a ejecutarse.
    effect(
      () => {
        // -- Obtenemos las categorías y marcas de cada store guardados en su estado interno items --
        // 1ro se cargaraon vacios (porque el constructor se dispara antes que el ngOnInit), luego cuando se ejecutó ngOnInit y cada store hizo su loadAll()
        // effect detecta el cambio y se vuelve a activar, esta vez con las categorias y marcas ya cargadas, lo que permite inicializar correctamente el filtro
        // de la grilla con las opciones de categorías y marcas disponibles.
        const categories = this.categoryStore.items();
        const brands = this.brandStore.items();
        // pasamos las categorias y marcas al método para cargar los selectItems para el componente grid-filter
        this._initializeGridFilter(categories, brands);
      },
      { allowSignalWrites: true }, // Para Permitir que este effect actualice otras Signals (gridFilterConfigSig dentro del método _initializeGridFilter()) sin disparar errores de ciclo de vida.
    );
  }

  private _createFilterGridForm() {
    return new FormGroup({
      id: new FormControl(''),
      title: new FormControl(''),
      categoryId: new FormControl<string | number>('all'),
      brandId: new FormControl<string | number>('all'),
      isActive: new FormControl<string | number>('all'),
    });
  }

  ngOnInit() {
    this._loadData();
    // Le decimos a cada Store que cargue los datos, cada store va a guardar sus datos en su estado interno en "items" (esto hace que el effect de arriba se ejecute al terminar)
    this.categoryStore.loadAll();
    this.brandStore.loadAll();
  }

  onFilterCollapseChange(isCollapsed: boolean): void {
    this.isFilterCollapsedSig.set(isCollapsed);
  }

  onGridPageChange(event: PageEvent): void {
    const currentPageIndex = Number(this.gridConfigSig().paginator?.pageIndex || 0);
    const totalPages = Math.ceil(event.length / event.pageSize);

    const isLastPage = event.pageIndex === totalPages - 1 && totalPages > 1;
    const isForward = event.pageIndex > currentPageIndex;
    const isFirstPage = event.pageIndex === 0;

    if (isLastPage) {
      this.productAdminStore.loadProducts({
        last: event.pageSize,
      });
    } else if (isFirstPage) {
      this._loadData();
    } else if (isForward) {
      this.productAdminStore.loadProducts({
        first: event.pageSize,
        after: this.productAdminStore.endCursor(),
      });
    } else {
      this.productAdminStore.loadProducts({
        last: event.pageSize,
        before: this.productAdminStore.startCursor(),
      });
    }

    this.gridConfigSig.update((config) => ({
      ...config,
      paginator: {
        ...config.paginator!,
        pageIndex: event.pageIndex,
        pageSize: event.pageSize,
      },
    }));
  }

  applyFilter(): void {
    console.log('Aplicar filtros con parámetros:', this.gridFilterFormSig().value);
    // Lógica de filtros...
    this._loadData();
  }

  /*   applyFilter(filterValues: Record<string, unknown>): void {
    this._productFilterParams = {};
    this._setProductFilterParameters();
    const isFilterClear = Object.values(filterValues).every(
      (value): boolean =>
        value === null ||
        value === '' ||
        value === 'all' ||
        (typeof value === 'object' &&
          value !== null &&
          Object.values(value).every((val): boolean => val === null || val === '')),
    );
    if (isFilterClear) {
      this._createChips(this._defaultChips);
      this._initializeGridFilter();
    } else {
      this._createChips(filterValues);
      const filterParamsForBackend =
                this._mapToProductFilterParams(filterValues);
            Object.assign(this._productFilterParams, filterParamsForBackend);
   
    }
    if (this.gridConfigSig().paginator) {
      this.gridConfigSig().paginator.pageIndex = 0;
    }
    this._loadData();
  } */

  onGridSortChange(sortEvent: Sort): void {
    // 1. Actualizamos el estado de orden en el Store
    this.productAdminStore.updateSort(sortEvent);
    // 2. Sincronizamos la UI local
    this._updateGridConfigOnSortChange(sortEvent);
    // 3. Recargamos los datos (el Store aplicará el sortConfig internamente)
    this._loadData(this.productAdminStore.filterQuery());
    // 4. Parametros para exportar excel con ordenamiento aplicado
    /* this._productFilterParams = {
      ...this._productFilterParams,
      sortColumn: sortEvent.active,
      sortOrder: sortEvent.direction,
      page: 1,
    }; */
  }

  private _updateGridConfigOnSortChange(sortEvent: Sort): void {
    const basePaginationConfig = this.gridConfigSig().paginator || this._defaultPaginatorOptions;
    // cambio de referencia de un objeto signal
    this.gridConfigSig.update(
      (currentValue): GridConfiguration => ({
        ...currentValue,
        OrderBy: {
          columnName: sortEvent.active,
          direction: sortEvent.direction,
        },
        paginator: {
          ...basePaginationConfig,
          pageIndex: 0,
        },
      }),
    );
  }

  onSearchInputValue(searchValue: string): void {
    this._loadData(searchValue);
  }

  onExportToExcel(): void {
    this._spinnerService.show();

    // 1. Capturamos TODO el estado actual: Orden, Búsqueda Rápida y Filtros del Panel
    const sortConfig = this.gridConfigSig().OrderBy;
    const quickSearch = this.productAdminStore.filterQuery(); // El input de arriba
    const panelFilters = this.gridFilterFormSig().value; // El panel de la derecha

    const exportParams: ProductFilterParams = {
      // Búsqueda rápida
      search: quickSearch,

      // Ordenamiento
      sortBy: sortConfig?.columnName || 'id',
      order: sortConfig?.direction || 'desc',

      // FILTROS DEL PANEL (Esto es lo que te faltaba conectar)
      id: panelFilters.id,
      title: panelFilters.title,

      // Validamos 'all' para Categoría y Marca
      categoryId:
        panelFilters.categoryId && panelFilters.categoryId !== 'all'
          ? panelFilters.categoryId
          : null,

      brandId: panelFilters.brandId && panelFilters.brandId !== 'all' ? panelFilters.brandId : null,

      // Lógica para isActive (convertir a lo que el Backend REST espera)
      isActive: panelFilters.isActive === 'all' ? null : panelFilters.isActive,
    };

    // 2. Llamada al servicio REST enviando todos los filtros
    this._productServices
      .getFilteredProductsAdmin(1, 1000, exportParams)
      .pipe(
        first(),
        map((res) => res.items || []),
        map((products) => this._mapToExcelRows(products)),
      )
      .subscribe({
        next: (processedData) => {
          if (processedData.length > 0) {
            const fileName = `Reporte_Admin_${new Date().getTime()}.xlsx`;
            this._exportService.exportToExcel(processedData, fileName);
          }
          this._spinnerService.hide();
          this._cdr.markForCheck();
        },
        error: () => {
          this._spinnerService.hide();
          this._cdr.markForCheck();
        },
      });
  }

  private _mapToExcelRows(products: ProductAdminGrid[]): any[] {
    // 1. Obtenemos los mapas de los stores
    const categories = this.categoryStore.categoryMap();
    const brands = this.brandStore.brandMap();

    return products.map((p) => {
      // 2. Buscamos el nombre de la categoría y marca usando los mapas de los store
      const categoryName = categories[Number(p.categoryId)]?.name || 'N/A';
      const brandName = brands[Number(p.brandId)]?.name || 'N/A';

      return {
        ID: p.id,
        Producto: p.title,
        'Precio Unitario': p.price,
        'Descuento (%)': p.discountPercentage || 0,
        'Precio Final': p.finalPrice,
        SKU: p.sku,
        'Stock Actual': p.stock,
        Categoría: categoryName,
        Marca: brandName,
        Estado: p.isActive ? 'Activo' : 'Inactivo',
      };
    });
  }

  onRemoveChip(chip: Chip): void {
    /* const fieldName = chip.key;
        const resetStrategies = {
            position: (): void =>
                this.gridFilterFormSig().get(fieldName)?.patchValue("all"),
            country: (): void =>
                this.gridFilterFormSig().get(fieldName)?.patchValue("all"),
            active: (): void =>
                this.gridFilterFormSig().get(fieldName)?.patchValue("all"),
            gender: (): void =>
                this.gridFilterFormSig().get(fieldName)?.patchValue("all"),
            birthDateRange: (): void =>
                this.gridFilterFormSig().get(fieldName)?.patchValue({
                    startDate: null,
                    endDate: null,
                }),
            default: (): void =>
                this.gridFilterFormSig().get(fieldName)?.patchValue(null),
        };
        const resetAction =
            resetStrategies[fieldName as keyof typeof resetStrategies] ||
            resetStrategies.default;
        resetAction();

        this.applyFilter(this.gridFilterFormSig().value); */
  }

  private _createChips(filterValues: Record<string, unknown>): void {
    //this.chipsSig.set(this._mapToChipsDescription(filterValues));
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
        query: this.productAdminStore.filterQuery(),
        first: 30,
        after: this.productAdminStore.endCursor(), // Aquí es donde GraphQL sabe dónde quedó
      });
    }
  }

  /* private _loadData(query = '') {
    const pageSize = Number(this.gridConfigSig().paginator?.pageSize) || 25;
    this.productAdminStore.loadProducts({
      search: query,
      first: pageSize,
    });
  } */

  private _loadData(quickQuery?: string) {
    this.productAdminStore.loadProducts({
      query: quickQuery ?? this.productAdminStore.filterQuery(), // El valor del input superior
      filters: this.gridFilterFormSig().value, // Los valores del panel lateral
      first: 25,
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

  /* private _setProductFilterParameters(): void {
    this._productFilterParams = {};
    this._productFilterParams.page = 1;
    this._productFilterParams.limit = 25;
    this._productFilterParams.sortColumn = 'id';
    this._productFilterParams.sortOrder = 'asc';
  } */

  private _setGridConfiguration(): GridConfiguration {
    return createDefaultGridConfiguration({
      columns: [
        {
          name: 'thumbnail',
          width: '100px',
          type: 'img',
          isSortable: false,
          hasHeader: false,
          label: 'Img',
        },
        { name: 'id', width: '100px', isSortable: true, label: 'ID' },
        { name: 'title', width: '200px', label: 'Título' },
        { name: 'price', width: '120px', label: 'Precio' },
        { name: 'discountPercentage', width: '100px', label: 'Descuento' },
        { name: 'finalPrice', width: '120px', isSortable: false, label: 'Precio Final' },
        { name: 'sku', label: 'SKU' },
        { name: 'stock', isSortable: false, label: 'Stock' },
        { name: 'categoryId', isSortable: false, label: 'Categoría' },
        { name: 'brandId', isSortable: false, label: 'Marca' },
        {
          name: 'isActive',
          class: 'status-circle',
          align: 'center',
          width: '75px',
          label: 'Estado',
        },
        {
          name: 'elipsisActions',
          width: '100px',
          align: 'center',
          type: 'elipsis',
          hasHeader: false,
        },
      ],
      paginator: {
        pageSize: 25,
        pageSizeOptions: [25, 50],
        totalCount: 0,
        pageIndex: 0,
        isServerSide: true,
      },
      hasSorting: { isServerSide: true },
      hasInputSearch: true,
      OrderBy: { columnName: 'id', direction: 'asc' },
      hasChips: true,
      actionButtons: [
        {
          class: 'download-button',
          type: 'download',
          icon: '/icons/download.svg',
          tooltip: 'Descargar excel',
        },
      ],
    });
  }

  private _initializeGridFilter(categories: ProductCategory[], brands: ProductBrand[]): void {
    const config: GridFilterConfig[] = [
      { fieldName: 'id', fieldType: 'text', label: 'Id' },
      { fieldName: 'title', fieldType: 'text', label: 'Título' },
      {
        fieldName: 'categoryId',
        fieldType: 'select',
        label: 'Categoría',
        selectItems: [
          { id: 'all', name: 'Todas' },
          ...categories.map((c) => ({ id: c.id, name: c.name })),
        ],
      },
      {
        fieldName: 'brandId',
        fieldType: 'select',
        label: 'Marca',
        selectItems: [
          { id: 'all', name: 'Todas' },
          ...brands.map((b) => ({ id: b.id, name: b.name })),
        ],
      },
      {
        fieldName: 'isActive',
        fieldType: 'select',
        label: 'Estado',
        selectItems: [
          { id: 'all', name: 'Todos' },
          { id: 1, name: 'Activo' },
          { id: 0, name: 'Inactivo' },
        ],
      },
    ];

    // ACTUALIZA SIGNAL DE CONFIGURACIÓN DE FILTROS
    this.gridFilterConfigSig.set(config);
    // CREACIÓN DINÁMICA DE CONTROLES PARA EL FORMULARIO
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
      }
    });

    // ACTUALIZA SIGNAL DEL FORMULARIO DEL FILTRO DE LA GRILLA CON LOS CONTROLES DINÁMICOS CREADOS
    this.gridFilterFormSig.set(new FormGroup(formControls));
  }
}

import {
  Component,
  Output,
  EventEmitter,
  inject,
  Input,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CustomerProductFilter } from '@features/products/models/costumer-product-filter.model';
import { BrandStore } from '@features/brands/state/brand.store';
import { CategoryStore } from '@features/categories/state/category.store';
import { ProductStore } from '@features/products/state/product.store';
import { ProductService } from '@features/products/services/product-service';
import { totalProductsByCategory } from '@features/products/models/total-products-by-category.model';
import { ProductCategory } from '@features/categories/models/product-category.model';

export interface FilterItem {
  id: string | number;
  name: string;
  count: number;
}

export interface RatingOption {
  stars: number;
  label: string;
  count: number;
}

@Component({
  selector: 'app-product-filter',
  standalone: true,
  imports: [ReactiveFormsModule, MatSliderModule],
  templateUrl: './product-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './product-filter.scss',
})
export class ProductFilter implements OnInit {
  @Input() isFilterVisible = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  @Output() emitFilterChange = new EventEmitter<CustomerProductFilter>();

  filterForm!: FormGroup;

  // -----------------------------------------------------------------
  // ACA SE PODRIA HACER QUE MUESTRE TODAS LAS CATEGORIAS Y MARCAS, PERO SOLO CUANDO HAYA PRODUCTOS EN ELLAS,
  // USANDO EL NUEVO ENPOINT QUE TRAE LA CANTIDAD DE PRODUCTOS POR CATEGORIA
  // ----------------------------------------------------------------

  readonly productStore = inject(ProductStore);
  readonly brandStore = inject(BrandStore);
  readonly categoryStore = inject(CategoryStore);
  private _productService = inject(ProductService);
  private _fb = inject(FormBuilder);

  private _maxPrice = 7000000; // Precio máximo para el slider, se puede ajustar según sea necesario

  readonly quantityProductsByCategory = signal<totalProductsByCategory[]>([]);
  // Toggle "See more" in lists
  showAllCategories = signal(false);
  showAllBrands = signal(false);

  // Toggle collapsible sections
  isPriceExpanded = signal(true);
  isCategoryExpanded = signal(true);
  isBrandsExpanded = signal(true);
  isRatingsExpanded = signal(true);

  togglePriceSection() {
    this.isPriceExpanded.update((v) => !v);
  }

  toggleCategorySection() {
    this.isCategoryExpanded.update((v) => !v);
  }

  toggleBrandsSection() {
    this.isBrandsExpanded.update((v) => !v);
  }

  toggleRatingsSection() {
    this.isRatingsExpanded.update((v) => !v);
  }

  readonly ratingOptions: RatingOption[] = [
    { stars: 5, label: '', count: 25 },
    { stars: 4, label: 'and up', count: 54 },
    { stars: 3, label: 'and up', count: 78 },
    { stars: 2, label: 'and up', count: 42 },
    { stars: 1, label: 'and up', count: 35 },
  ];

  // Check if any filter is active
  hasActiveFilters = computed(() => {
    if (!this.filterForm) return false;
    const val = this.filterForm.value;
    return (
      (val.minPrice !== null && val.minPrice > 0) ||
      (val.maxPrice !== null && val.maxPrice < this._maxPrice) ||
      !!val.categoryId ||
      !!val.brandId ||
      val.minRating !== null
    );
  });

  visibleCategories = computed(() => {
    const items = this.categoryStore.items();

    if (items.length === 0) {
      return [];
    }
    // 1. Si el usuario hizo clic en "Ver mas", devolvemos todas las categorías
    if (this.showAllCategories()) {
      return items;
    }
    // 2. Si son más de 7 y NO está expandido, mostramos solo las primeras 7
    if (items.length > 7) {
      return items.slice(0, 7);
    }

    return items;
  });

  visibleBrands = computed(() => {
    const items = this.brandStore.items();

    if (items.length === 0) {
      return [];
    }
    // 1. Si el usuario hizo clic en "Ver mas", devolvemos todas las marcas
    if (this.showAllBrands()) {
      return items;
    }
    // 2. Si son más de 7 y NO está expandido, mostramos solo las primeras 7
    if (items.length > 7) {
      return items.slice(0, 7);
    }
    // 3. Por defecto (si son 7 o menos), devolvemos todas
    return items;
  });

  constructor() {
    this._createForm();
  }

  ngOnInit() {
    if (this.categoryStore.items().length === 0) {
      this.categoryStore.loadAll();
    }
    if (this.brandStore.items().length === 0) {
      this.brandStore.loadAll();
    }
    // Cargando la cantidad de productos por categoría
    this._getTotalProductsByCategory();
  }

  // Price slider change handler
  onPriceChange() {
    this.applyFilters();
  }

  // Category selection handler
  toggleCategory(id: string | number) {
    const strId = id.toString();
    const current = this.filterForm.get('categoryId')?.value;
    const newValue = current === strId ? '' : strId;
    this.filterForm.patchValue({ categoryId: newValue });
    this.applyFilters();
  }

  isCategorySelected(id: string | number): boolean {
    return this.filterForm.get('categoryId')?.value === id.toString();
  }

  // Brand selection handler
  toggleBrand(id: string | number) {
    const strId = id.toString();
    const current = this.filterForm.get('brandId')?.value;
    const newValue = current === strId ? '' : strId;
    this.filterForm.patchValue({ brandId: newValue });
    this.applyFilters();
  }

  isBrandSelected(id: string | number): boolean {
    return this.filterForm.get('brandId')?.value === id.toString();
  }

  // Rating selection handler
  toggleRating(stars: number) {
    const current = this.filterForm.get('minRating')?.value;
    const newValue = current === stars ? null : stars;
    this.filterForm.patchValue({ minRating: newValue });
    this.applyFilters();
  }

  isRatingSelected(stars: number): boolean {
    return this.filterForm.get('minRating')?.value === stars;
  }

  applyFilters() {
    this.emitFilterChange.emit(this.filterForm.value);
  }

  clearFilters() {
    this.filterForm.reset({
      search: '',
      minPrice: 0,
      maxPrice: this._maxPrice,
      categoryId: '',
      brandId: '',
      minRating: null,
      sortBy: 'rating',
      order: 'asc',
    });
    this.applyFilters();
  }

  toggleCategoriesExpand() {
    this.showAllCategories.update((v) => !v);
  }

  toggleBrandsExpand() {
    this.showAllBrands.update((v) => !v);
  }

  private _createForm() {
    this.filterForm = this._fb.group({
      search: [''],
      minPrice: [0],
      maxPrice: [this._maxPrice],
      categoryId: [''],
      brandId: [''],
      minRating: [null],
      sortBy: ['rating'],
      order: ['asc'],
    });
  }

  private _getTotalProductsByCategory() {
    this._productService.getQuantityProductsByCategory().subscribe({
      next: (productsByCategory) => this.quantityProductsByCategory.set(productsByCategory),
      error: (err) => console.error('Error al cargar conteos por categoría:', err),
    });
  }
}

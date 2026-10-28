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
import { ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { CustomerProductFilter } from '@features/products/models/costumer-product-filter.model';
import { BrandStore } from '@features/brands/state/brand.store';
import { CategoryStore } from '@features/categories/state/category.store';
import { ProductStore } from '@features/products/state/product.store';
import { ProductService } from '@features/products/services/product-service';
import { totalProductsByCategory } from '@features/products/models/total-products-by-category.model';
import { totalProductsByBrand } from '@features/products/models/total-products-by-brand.model';

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

  readonly productStore = inject(ProductStore);
  readonly brandStore = inject(BrandStore);
  readonly categoryStore = inject(CategoryStore);
  private _productService = inject(ProductService);
  private _maxPrice = 7000000;

  // Estado del filtro centralizado en una Signal pura
  readonly filters = signal<CustomerProductFilter>({
    search: '',
    minPrice: 0,
    maxPrice: this._maxPrice,
    categoryIds: [],
    brandIds: [],
    minRating: null,
    sortBy: 'rating',
    order: 'asc',
  });

  readonly quantityProductsByCategory = signal<totalProductsByCategory[]>([]);
  readonly quantityProductsByBrand = signal<totalProductsByBrand[]>([]);

  // Toggle "Ver más"
  showAllCategories = signal(false);
  showAllBrands = signal(false);

  // Toggle secciones colapsables
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

  // Comprueba si hay algún filtro activo de manera completamente reactiva
  hasActiveFilters = computed(() => {
    const filter = this.filters();
    return (
      (filter.minPrice !== null && filter.minPrice > 0 && filter.minPrice !== undefined) ||
      (filter.maxPrice !== null &&
        filter.maxPrice < this._maxPrice &&
        filter.maxPrice !== undefined) ||
      (filter.categoryIds?.length ?? 0) > 0 ||
      (filter.brandIds?.length ?? 0) > 0 ||
      (filter.minRating !== null && filter.minRating !== undefined)
    );
  });

  visibleCategories = computed(() => {
    const items = this.categoryStore.items();
    if (items.length === 0) return [];
    if (this.showAllCategories()) return items;
    if (items.length > 7) return items.slice(0, 7);
    return items;
  });

  visibleBrands = computed(() => {
    const items = this.brandStore.items();
    if (items.length === 0) return [];
    if (this.showAllBrands()) return items;
    if (items.length > 7) return items.slice(0, 7);
    return items;
  });

  ngOnInit() {
    if (this.categoryStore.items().length === 0) {
      this.categoryStore.loadAll();
    }
    if (this.brandStore.items().length === 0) {
      this.brandStore.loadAll();
    }
    this._getTotalProductsByCategory();
    this._getTotalProductsByBrand();
  }

  // Actualización de Rango de Precios
  updatePrice(minPrice: number, maxPrice: number) {
    this.filters.update((curr) => ({ ...curr, minPrice, maxPrice }));
    this.applyFilters();
  }

  // --- SELECCIÓN MÚLTIPLE DE CATEGORÍAS ---
  toggleCategory(id: string | number) {
    const numId = Number(id);
    this.filters.update((curr) => {
      const currentCategories: number[] = curr.categoryIds || [];
      const index = currentCategories.indexOf(numId);
      const updated =
        index > -1 ? currentCategories.filter((x) => x !== numId) : [...currentCategories, numId];
      return { ...curr, categoryIds: updated };
    });
    this.applyFilters();
  }

  isCategorySelected(id: string | number): boolean {
    const currentCategories: number[] = this.filters().categoryIds || [];
    return currentCategories.includes(Number(id));
  }

  // --- SELECCIÓN MÚLTIPLE DE MARCAS ---
  toggleBrand(id: string | number) {
    const numId = Number(id);
    this.filters.update((curr) => {
      const currentBrands: number[] = curr.brandIds || [];
      const index = currentBrands.indexOf(numId);
      const updated =
        index > -1 ? currentBrands.filter((x) => x !== numId) : [...currentBrands, numId];
      return { ...curr, brandIds: updated };
    });
    this.applyFilters();
  }

  isBrandSelected(id: string | number): boolean {
    const currentBrands: number[] = this.filters().brandIds || [];
    return currentBrands.includes(Number(id));
  }

  // Selección de Rating
  toggleRating(stars: number) {
    this.filters.update((curr) => {
      const currentRating = curr.minRating;
      const newValue = currentRating === stars ? null : stars;
      return { ...curr, minRating: newValue };
    });
    this.applyFilters();
  }

  isRatingSelected(stars: number): boolean {
    return this.filters().minRating === stars;
  }

  applyFilters() {
    this.emitFilterChange.emit(this.filters());
  }

  clearFilters() {
    this.filters.set({
      search: '',
      minPrice: 0,
      maxPrice: this._maxPrice,
      categoryIds: [],
      brandIds: [],
      minRating: null,
      sortBy: 'rating',
      order: 'asc',
    });
    this.applyFilters();
  }

  emitToggleSidebar() {
    this.toggleSidebar.emit(true);
  }

  toggleCategoriesExpand() {
    this.showAllCategories.update((v) => !v);
  }

  toggleBrandsExpand() {
    this.showAllBrands.update((v) => !v);
  }

  private _getTotalProductsByCategory() {
    this._productService.getTotalProductsByCategory().subscribe({
      next: (productsByCategory) => this.quantityProductsByCategory.set(productsByCategory),
      error: (err) => console.error('Error al cargar total de productos por categoría:', err),
    });
  }

  private _getTotalProductsByBrand() {
    this._productService.getTotalProductsByBrand().subscribe({
      next: (productsByBrand) => this.quantityProductsByBrand.set(productsByBrand),
      error: (err) => console.error('Error al cargar total de productos por marca:', err),
    });
  }
}

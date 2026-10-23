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
  filterForm!: FormGroup;
  readonly productStore = inject(ProductStore);
  readonly brandStore = inject(BrandStore);
  readonly categoryStore = inject(CategoryStore);
  private _productService = inject(ProductService);
  private _fb = inject(FormBuilder);
  private _maxPrice = 7000000;
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
  // Comprueba si hay algún filtro activo
  hasActiveFilters = computed(() => {
    if (!this.filterForm) return false;
    const val = this.filterForm.value;
    return (
      (val.minPrice !== null && val.minPrice > 0) ||
      (val.maxPrice !== null && val.maxPrice < this._maxPrice) ||
      val.categoryIds?.length > 0 ||
      val.brandIds?.length > 0 ||
      val.minRating !== null
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
    this._getTotalProductsByCategory();
    this._getTotalProductsByBrand();
  }
  onPriceChange() {
    this.applyFilters();
  }
  // --- SELECCIÓN MÚLTIPLE DE CATEGORÍAS ---
  toggleCategory(id: string | number) {
    const numId = Number(id);
    const current: number[] = this.filterForm.get('categoryIds')?.value || [];
    const index = current.indexOf(numId);
    const updated =
      index > -1
        ? current.filter((x) => x !== numId) // Si ya está, se quita
        : [...current, numId]; // Si no está, se agrega
    this.filterForm.patchValue({ categoryIds: updated });
    this.applyFilters();
  }
  isCategorySelected(id: string | number): boolean {
    const current: number[] = this.filterForm.get('categoryIds')?.value || [];
    return current.includes(Number(id));
  }
  // --- SELECCIÓN MÚLTIPLE DE MARCAS ---
  toggleBrand(id: string | number) {
    const numId = Number(id);
    const current: number[] = this.filterForm.get('brandIds')?.value || [];
    const index = current.indexOf(numId);
    const updated =
      index > -1
        ? current.filter((x) => x !== numId) // Si ya está, se quita
        : [...current, numId]; // Si no está, se agrega
    this.filterForm.patchValue({ brandIds: updated });
    this.applyFilters();
  }
  isBrandSelected(id: string | number): boolean {
    const current: number[] = this.filterForm.get('brandIds')?.value || [];
    return current.includes(Number(id));
  }
  // Selección de Rating
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
      categoryIds: [],
      brandIds: [],
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
      categoryIds: [[] as number[]],
      brandIds: [[] as number[]],
      minRating: [null],
      sortBy: ['rating'],
      order: ['asc'],
    });
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

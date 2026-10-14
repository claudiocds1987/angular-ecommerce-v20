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
  readonly brands = inject(BrandStore);
  readonly categories = inject(CategoryStore);
  private _fb = inject(FormBuilder);

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

  // Default mock list matching the mockup image
  private readonly _defaultCategories: FilterItem[] = [
    { id: '1', name: 'Accessories', count: 25 },
    { id: '2', name: 'Appliances', count: 54 },
    { id: '3', name: 'Bags', count: 78 },
    { id: '4', name: 'Electronic', count: 42 },
    { id: '5', name: 'Entertainment', count: 35 },
    { id: '6', name: 'Induction', count: 64 },
    { id: '7', name: 'Mobile Phone', count: 92 },
  ];

  private readonly _defaultBrands: FilterItem[] = [
    { id: '1', name: 'Appliances', count: 25 },
    { id: '2', name: 'Bags', count: 54 },
    { id: '3', name: 'Electronic', count: 78 },
    { id: '4', name: 'Entertainment', count: 42 },
    { id: '5', name: 'Induction', count: 35 },
    { id: '6', name: 'Laptops', count: 64 },
  ];

  readonly ratingOptions: RatingOption[] = [
    { stars: 5, label: '', count: 25 },
    { stars: 4, label: 'and up', count: 54 },
    { stars: 3, label: 'and up', count: 78 },
    { stars: 2, label: 'and up', count: 42 },
    { stars: 1, label: 'and up', count: 35 },
  ];

  // Dynamic or fallback categories
  displayCategories = computed<FilterItem[]>(() => {
    const items = this.categories.items();
    if (!items || items.length === 0) {
      return this._defaultCategories;
    }
    return items.map((cat, idx) => ({
      id: cat.id,
      name: cat.name,
      count: this._getCountForCategory(cat.id, idx),
    }));
  });

  visibleCategories = computed(() => {
    const cats = this.displayCategories();
    return this.showAllCategories() ? cats : cats.slice(0, 7);
  });

  // Dynamic or fallback brands
  displayBrands = computed<FilterItem[]>(() => {
    const items = this.brands.items();
    if (!items || items.length === 0) {
      return this._defaultBrands;
    }
    return items.map((brand, idx) => ({
      id: brand.id,
      name: brand.name,
      count: this._getCountForBrand(brand.id, idx),
    }));
  });

  visibleBrands = computed(() => {
    const brs = this.displayBrands();
    return this.showAllBrands() ? brs : brs.slice(0, 6);
  });

  // Check if any filter is active
  hasActiveFilters = computed(() => {
    if (!this.filterForm) return false;
    const val = this.filterForm.value;
    return (
      (val.minPrice !== null && val.minPrice > 0) ||
      (val.maxPrice !== null && val.maxPrice < 2000) ||
      !!val.categoryId ||
      !!val.brandId ||
      val.minRating !== null
    );
  });

  constructor() {
    this._createForm();
  }

  ngOnInit() {
    if (this.categories.items().length === 0) {
      this.categories.loadAll();
    }
    if (this.brands.items().length === 0) {
      this.brands.loadAll();
    }
  }

  private _createForm() {
    this.filterForm = this._fb.group({
      search: [''],
      minPrice: [0],
      maxPrice: [2000],
      categoryId: [''],
      brandId: [''],
      minRating: [null],
      sortBy: ['rating'],
      order: ['asc'],
    });
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
      maxPrice: 2000,
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

  private _getCountForCategory(catId: number, index: number): number {
    const products = this.productStore.items();
    if (products && products.length > 0) {
      const count = products.filter((p) => p.categoryId === catId).length;
      if (count > 0) return count;
    }
    const fallbacks = [25, 54, 78, 42, 35, 64, 92];
    return fallbacks[index % fallbacks.length];
  }

  private _getCountForBrand(brandId: number, index: number): number {
    const products = this.productStore.items();
    if (products && products.length > 0) {
      const count = products.filter((p) => p.brandId === brandId).length;
      if (count > 0) return count;
    }
    const fallbacks = [25, 54, 78, 42, 35, 64];
    return fallbacks[index % fallbacks.length];
  }
}

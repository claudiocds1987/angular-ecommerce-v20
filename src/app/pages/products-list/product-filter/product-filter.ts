import { Component, Output, EventEmitter, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerProductFilter } from '../../../shared/models/costumer-product-filter.model';
import { ProductStore } from '../../admin/state/product.store';
import { BrandStore } from '../../admin/state/brand.store';
import { CategoryStore } from '../../admin/state/category.store';

@Component({
  selector: 'app-product-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './product-filter.html',
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

  constructor() {
    this._createForm();
  }

  ngOnInit() {
    // CARGA BAJO DEMANDA (Lazy Loading):
    // Verificamos si los catálogos ya existen en memoria antes de pedirlos.
    // Esto optimiza el rendimiento al evitar peticiones HTTP duplicadas al servidor
    // cada vez que el usuario entra a este componente, especialmente útil si
    // las listas de marcas y categorías llegan a tener cientos de registros.
    if (this.categories.items().length === 0) {
      this.categories.loadAll();
    }
    if (this.brands.items().length === 0) {
      this.brands.loadAll();
    }
  }

  applyFilters() {
    this.emitFilterChange.emit(this.filterForm.value);
  }

  clearFilters() {
    this.filterForm.reset({
      search: '',
      minPrice: null,
      maxPrice: null,
      categoryId: '',
      sortBy: 'rating',
      order: 'asc',
    });
    this.applyFilters();
  }

  private _createForm() {
    this.filterForm = this._fb.group({
      search: [''],
      minPrice: [null],
      maxPrice: [null],
      categoryId: [''],
      sortBy: ['rating'],
      order: ['asc'],
    });
  }
}

import { Component, Output, EventEmitter, OnInit, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';
//import { ProductService } from '../../../shared/services/product-service';
import { CategoryService } from '../../../shared/services/category-service';
//import { Product } from '../../../shared/models/product.model';
import { ProductCategory } from '../../../shared/models/product-category.model';
import { ProductStore } from '../../admin/state/product.store';

@Component({
  selector: 'app-product-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './product-filter.html',
  styleUrl: './product-filter.scss',
})
export class ProductFilter {
  @Input() isFilterVisible = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  @Output() emitFilterChange = new EventEmitter<ProductFilterData>();

  filterForm!: FormGroup;

  readonly productStore = inject(ProductStore);

  private _fb = inject(FormBuilder);

  constructor() {
    this._createForm();
  }

  applyFilters() {
    this.emitFilterChange.emit(this.filterForm.value);
  }

  clearFilters() {
    this.filterForm.reset({
      search: '',
      minPrice: null,
      maxPrice: null,
      category: '',
      sortBy: 'title',
      order: 'asc',
    });
    this.applyFilters();
  }

  private _createForm() {
    this.filterForm = this._fb.group({
      search: [''],
      minPrice: [null],
      maxPrice: [null],
      category: [''],
      sortBy: ['title'],
      order: ['asc'],
    });
  }
}

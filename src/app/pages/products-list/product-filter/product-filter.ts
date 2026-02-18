import { Component, Output, EventEmitter, OnInit, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';
import { ProductService } from '../../../shared/services/product-service';

@Component({
  selector: 'app-product-filter',
  imports: [ReactiveFormsModule],
  templateUrl: './product-filter.html',
  styleUrl: './product-filter.scss',
})
export class ProductFilter implements OnInit {
  @Input() isFilterVisible = true;
  @Output() toggleSidebar = new EventEmitter<boolean>();
  @Output() emitFilterChange = new EventEmitter<ProductFilterData>();

  filterForm!: FormGroup;
  productCategories = signal<string[]>([]);

  private _fb = inject(FormBuilder);
  private _productService = inject(ProductService);

  ngOnInit() {
    this._createForm();
    this._getProductsCategoryList();
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
    this.emitFilterChange.emit(this.filterForm.value);
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

  private _getProductsCategoryList() {
    this._productService.getProductsCategoryList().subscribe((res) => {
      this.productCategories.set(res);
    });
  }
}

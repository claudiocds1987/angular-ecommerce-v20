import { Component, Output, EventEmitter, OnInit, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';

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

  private _fb = inject(FormBuilder);

  ngOnInit() {
    this.filterForm = this._fb.group({
      search: [''],
      minPrice: [null],
      maxPrice: [null],
      category: [''],
      sortBy: ['title'],
      order: ['asc'],
    });
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
}

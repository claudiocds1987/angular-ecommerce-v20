import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PurchasesStore } from '@features/purchases/store/purchases.store';
import { MatIconModule } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CategoryStore } from '@features/categories/state/category.store';

import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { MyPurchaseItem } from '@features/purchases/models/purchase.model';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCard,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormField,
    MatButtonModule,
    MatDialogModule,
  ],
  selector: 'app-user-purchases',
  styleUrl: './user-purchases.scss',
  templateUrl: './user-purchases.html',
})
export class UserPurchases {
  readonly purchasesStore = inject(PurchasesStore);
  readonly categoryStore = inject(CategoryStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Reemplazar por el id real del usuario autenticado cuando conectes AuthStore
  private readonly userId = 1;

  readonly purchases = this.purchasesStore.items;
  readonly categories = this.categoryStore.items;

  readonly filtersModel = signal({
    search: '',
    categoryId: null as number | null,
    dateFrom: '',
    dateTo: '',
  });

  readonly filtersForm = form(this.filtersModel, () => {});

  constructor() {
    this.categoryStore.loadAll();

    // 1. Carga inicial inmediata sin esperar el debounce
    this.purchasesStore.loadMyPurchases({ userId: this.userId });

    // 2. Escucha cambios posteriores en los filtros con debounce
    toObservable(this.filtersModel)
      .pipe(
        skip(1),
        debounceTime(400),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((filters) => {
        this.purchasesStore.updateFilters(this.userId, {
          search: filters.search.trim() || null,
          categoryId: filters.categoryId,
          dateFrom: filters.dateFrom || null,
          dateTo: filters.dateTo || null,
        });
      });
  }

  resetFilters(): void {
    this.filtersModel.set({
      search: '',
      categoryId: null,
      dateFrom: '',
      dateTo: '',
    });

    this.purchasesStore.resetFilters(this.userId);
  }

  buyAgain(item: MyPurchaseItem, event: Event): void {
    // Evita que se dispare el (click) de la mat-card que lleva al detalle del producto
    event.stopPropagation();
    this.router.navigate(['/product-detail', item.productId]);
  }
}

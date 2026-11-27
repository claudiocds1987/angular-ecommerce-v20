import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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

import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductDetail } from '@pages/product-detail/product-detail';
import { AuthStore } from '@features/auth/state/auth.store';
import { PurchaseCard } from './purchase-card/purchase-card';

@Component({
  standalone: true,
  imports: [
    MatCard,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormField,
    MatButtonModule,
    MatDialogModule,
    PurchaseCard,
  ],
  selector: 'app-user-purchases',
  styleUrl: './user-purchases.scss',
  templateUrl: './user-purchases.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPurchases {
  readonly purchasesStore = inject(PurchasesStore);
  readonly categoryStore = inject(CategoryStore);
  readonly authStore = inject(AuthStore);

  private readonly destroyRef = inject(DestroyRef);
  private _matDialog = inject(MatDialog);

  // Obteniendo el id del usuario desde el AuthStore. Si no hay usuario, se asigna 0 como valor por defecto.
  private readonly userId = this.authStore.user()?.id ?? 0;

  readonly purchases = this.purchasesStore.items;
  readonly categories = this.categoryStore.items;

  readonly filtersModel = signal({
    search: '',
    categoryId: null as number | null,
    dateFrom: '',
    dateTo: '',
  });

  readonly filtersForm = form(this.filtersModel);

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

  buyAgain(productId: number): void {
    this._openDetailModal(productId);
  }

  private _openDetailModal(productId: number): void {
    this._matDialog.open(ProductDetail, {
      data: productId, // Enviamos el id producto al componente ProductDetail
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      backdropClass: 'custom-modal-backdrop', // Esta clase esta definida en styles.scss para que elefecto desenfoque funcione en todo el body
    });
  }
}

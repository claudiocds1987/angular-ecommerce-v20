import { inject, computed } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ProductCategory } from '../../../shared/models/product-category.model';
import { CategoryService } from '../../../shared/services/category-service';

export const CategoryStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as ProductCategory[],
    loading: false,
  }),
  withComputed((state) => ({
    // Mapeo completo de Categorías: { 1: {id: 1, name: 'Beauty'}, ... }
    categoryMap: computed(() =>
      state.items().reduce(
        (acc, cat) => {
          acc[cat.id] = cat;
          return acc;
        },
        {} as Record<number, ProductCategory>,
      ),
    ),
  })),
  withMethods((state, categoryService = inject(CategoryService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(state, { loading: true })),
        switchMap(() =>
          categoryService.getCategories().pipe(
            tap((items) => patchState(state, { items, loading: false })),
            catchError(() => {
              patchState(state, { loading: false });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);

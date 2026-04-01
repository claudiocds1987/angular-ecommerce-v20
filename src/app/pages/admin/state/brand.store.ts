import { inject, computed } from '@angular/core';
import { patchState, signalStore, withMethods, withState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ProductBrand } from '../../../shared/models/product-brand.model';
import { BrandService } from '../../../shared/services/brand-service';

export const BrandStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as ProductBrand[],
    loading: false,
  }),
  withComputed((state) => ({
    // Mapeo completo de Marcas: { 1: {id: 1, name: 'Apple'}, ... }
    brandMap: computed(() =>
      state.items().reduce(
        (acc, brand) => {
          acc[brand.id] = brand;
          return acc;
        },
        {} as Record<number, ProductBrand>,
      ),
    ),
  })),
  withMethods((state, brandService = inject(BrandService)) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(state, { loading: true })),
        switchMap(() =>
          brandService.getBrands().pipe(
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

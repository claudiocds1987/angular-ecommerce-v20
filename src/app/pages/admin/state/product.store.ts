/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime, distinctUntilChanged } from 'rxjs'; // Importamos 'map'

import { computed } from '@angular/core';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../../../shared/services/product-service';

import { CustomerProductFilter } from '../../../shared/models/costumer-product-filter.model';

//  Usando forma moderna "NgRX Signal Store" en lugar de NgRx, para manejar el estado de productos en el admin
//  rxMethod es la forma estándar en el Signal Store porque gestiona automáticamente el ciclo de vida de las suscripciones.
//  Permite usar operadores de RxJS sin preocuparme por fugas de memoria, manteniendo el código limpio y declarativo.)
//  patchState: Actualiza de forma parcial, inmutable y reactiva el estado, fusionando solo los cambios enviados.
//  ATOMICIDAD: Si cambias varias propiedades a la vez (ej. loading y error), la UI solo se actualiza una vez (evita renders innecesarios).

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as Product[],
    totalItems: 0,
    filterQuery: '',
    loading: false,
  }),

  withComputed((state) => ({
    // Filtro en memoria para búsqueda rápida
    filteredProducts: computed(() => {
      const query = state.filterQuery().toLowerCase();
      return state.items().filter((p) => p.title.toLowerCase().includes(query));
    }),
    productsCount: computed(() => state.items().length),
  })),

  withMethods((state, productService = inject(ProductService)) => ({
    updateQuery: (query: string) => patchState(state, { filterQuery: query }),

    removeProduct: (id: number) => {
      patchState(state, { items: state.items().filter((p) => p.id !== id) });
    },

    searchProducts: rxMethod<{ filters: CustomerProductFilter; page: number; size: number }>(
      pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        tap(() => patchState(state, { loading: true })),
        switchMap(({ filters, page, size }) =>
          productService.getFilteredProducts(page, size, filters).pipe(
            tap((res) => {
              patchState(state, {
                items: page === 1 ? res.items : [...state.items(), ...res.items],
                totalItems: res.totalItems,
                loading: false,
                filterQuery: filters.search || '',
              });
            }),
            catchError(() => {
              patchState(state, { loading: false });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    loadAllProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(state, { loading: true })),
        switchMap(() =>
          productService.getProducts().pipe(
            tap((products) => patchState(state, { items: products, loading: false })),
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

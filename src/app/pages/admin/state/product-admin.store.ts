import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { ProductAdminGrid } from '../../../shared/models/product-admin-grid.model'; // Ajusta la ruta

import { computed } from '@angular/core';
import { ProductGraphqlService } from '../../../shared/services/product-graphql-service';
import { ProductService } from '../../../shared/services/product-service';

export const ProductAdminStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as ProductAdminGrid[],
    totalItems: 0,
    hasNextPage: false,
    endCursor: '',
    loading: false,
    filterQuery: '',
  }),

  withComputed((state) => ({
    productsCount: computed(() => state.items().length),
  })),

  withMethods(
    (
      state,
      graphqlService = inject(ProductGraphqlService),
      productService = inject(ProductService),
    ) => ({
      // recibir filtros y el cursor
      loadProducts: rxMethod<{ search?: string; first: number; after?: string }>(
        pipe(
          // agregar debounceTime aquí para que el store maneje la espera de escritura
          tap(() => patchState(state, { loading: true })),
          switchMap(({ search, first, after }) =>
            graphqlService.getProducts(first, after).pipe(
              tap((res) => {
                patchState(state, {
                  // Si no hay 'after', es una búsqueda nueva o página 1 -> reemplazamos
                  // Si hay 'after', es scroll -> concatenamos
                  items: after ? [...state.items(), ...res.items] : res.items,
                  totalItems: res.totalItems,
                  hasNextPage: res.hasNextPage,
                  endCursor: res.endCursor,
                  loading: false,
                  filterQuery: search || '',
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

      updateFilter: (query: string) => patchState(state, { filterQuery: query }),

      removeProduct: rxMethod<string | number>(
        pipe(
          // 1. Solo marcamos que estamos procesando (opcional)
          tap(() => patchState(state, { loading: true })),

          switchMap((id) =>
            productService.deleteProduct(id as number).pipe(
              tap(() => {
                // 2. ELIMINAMOS RECIÉN AQUÍ (Cuando el backend confirmó el OK)
                const currentItems = state.items().filter((p) => String(p.id) !== String(id));

                patchState(state, {
                  items: currentItems,
                  totalItems: state.totalItems() - 1,
                  loading: false,
                });
                // agregar toast de éxito
                console.log('Producto desactivado con éxito');
              }),
              catchError(() => {
                patchState(state, { loading: false });
                alert('No se pudo eliminar');
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);

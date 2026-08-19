/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, delay } from 'rxjs';
import { ProductAdminGrid } from '@features/products/models/product-admin-grid.model';
import { computed } from '@angular/core';
import { ProductGraphqlService } from '@features/products/services/product-graphql-service';
import { ProductService } from '@features/products/services/product-service';
import { Sort } from '@angular/material/sort';
import { ProductFilterParams } from '@features/products/models/product-filter-params.model';

export const ProductAdminStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as ProductAdminGrid[],
    totalItems: 0,
    loading: false,
    filterQuery: '',
    sortConfig: { active: 'id', direction: 'asc' } as Sort,
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
      // recibir filtros y paginación offset
      loadProducts: rxMethod<{
        query?: string;
        filters?: ProductFilterParams;
        pageIndex?: number;
        pageSize?: number;
      }>(
        pipe(
          tap(() => patchState(state, { loading: true })),
          delay(300),
          switchMap((params) => {
            const andConditions: any[] = [];

            // --- FILTRO BÚSQUEDA RÁPIDA ---
            if (params.query?.trim()) {
              andConditions.push({ title: { contains: params.query } });
            }

            // --- FILTROS PANEL LATERAL ---
            if (params.filters) {
              const filter = params.filters;
              if (filter.id) andConditions.push({ id: { eq: Number(filter.id) } });
              if (filter.title) andConditions.push({ title: { contains: filter.title } });
              if (filter.categoryId && filter.categoryId !== 'all')
                andConditions.push({ categoryId: { eq: Number(filter.categoryId) } });
              if (filter.brandId && filter.brandId !== 'all')
                andConditions.push({ brandId: { eq: Number(filter.brandId) } });

              if (
                filter.isActive !== undefined &&
                filter.isActive !== null &&
                String(filter.isActive) !== 'all'
              ) {
                const isTrue =
                  String(filter.isActive) === 'true' || String(filter.isActive) === '1';
                andConditions.push({ isActive: { eq: isTrue } });
              }
            }

            const whereArg = andConditions.length > 0 ? { and: andConditions } : undefined;

            // --- VARIABLES skip/take ---
            const variables: any = {
              where: whereArg,
              order: state.sortConfig().direction
                ? [{ [state.sortConfig().active]: state.sortConfig().direction.toUpperCase() }]
                : [],
              skip: (params.pageIndex ?? 0) * (params.pageSize ?? 25),
              take: params.pageSize ?? 25,
            };

            // --- LLAMADA A GRAPHQL ---
            return graphqlService.getProducts(variables).pipe(
              tap((res) => {
                patchState(state, {
                  items: res.items,
                  totalItems: res.totalItems,
                  filterQuery: params.query ?? state.filterQuery(),
                  loading: false,
                });
              }),
              catchError((err) => {
                console.error('Error cargando productos:', err);
                patchState(state, { loading: false });
                return EMPTY;
              }),
            );
          }),
        ),
      ),

      updateSort: (sort: Sort) => patchState(state, { sortConfig: sort }),

      updateFilter: (query: string) => patchState(state, { filterQuery: query }),

      removeProduct: rxMethod<string | number>(
        pipe(
          tap(() => patchState(state, { loading: true })),
          switchMap((id) =>
            productService.updateProductStatus(id as number, false).pipe(
              tap(() => {
                const currentItems = state.items().filter((p) => String(p.id) !== String(id));
                patchState(state, {
                  items: currentItems,
                  totalItems: state.totalItems() - 1,
                  loading: false,
                });
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

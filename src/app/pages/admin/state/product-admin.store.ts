/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, delay } from 'rxjs';
import { ProductAdminGrid } from '../../../shared/models/product-admin-grid.model'; // Ajusta la ruta

import { computed } from '@angular/core';
import { ProductGraphqlService } from '../../../shared/services/product-graphql-service';
import { ProductService } from '../../../shared/services/product-service';
import { Sort } from '@angular/material/sort';
import { ProductFilterParams } from '../../../shared/models/product-filter-params.model';

export const ProductAdminStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as ProductAdminGrid[],
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    startCursor: '', // 1er registro de la página actual
    endCursor: '', // último registro de la página actual
    loading: false,
    filterQuery: '',
    sortConfig: { active: 'id', direction: 'asc' } as Sort, // Estado para el orden
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
      loadProducts: rxMethod<{
        query?: string;
        filters?: ProductFilterParams;
        first?: number;
        after?: string;
        last?: number;
        before?: string;
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

            // --- CONSTRUCCIÓN DINÁMICA DE VARIABLES (Limpieza de null/undefined) ---
            // Esto evita enviar "first: undefined" o "after: null" al servidor
            const variables: any = {
              where: whereArg,
              order: state.sortConfig().direction
                ? [{ [state.sortConfig().active]: state.sortConfig().direction.toUpperCase() }]
                : [],
            };

            if (params.first) variables.first = params.first;
            if (params.after) variables.after = params.after;
            if (params.last) variables.last = params.last;
            if (params.before) variables.before = params.before;

            // --- LLAMADA A GRAPHQL ---
            return graphqlService.getProducts(variables).pipe(
              tap((res) => {
                patchState(state, {
                  items: res.items,
                  totalItems: res.totalItems,
                  hasNextPage: res.hasNextPage,
                  hasPreviousPage: res.hasPreviousPage, // Guardamos estado para navegar atrás
                  endCursor: res.endCursor, // Cursor para "Siguiente"
                  startCursor: res.startCursor, // VITAL: Cursor para "Anterior"
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
      /* loadProducts: rxMethod<{
        search?: string;
        first?: number;
        after?: string;
        last?: number;
        before?: string;
      }>(
        pipe(
          tap(() => patchState(state, { loading: true })),
          switchMap((params) => {
            // 1. Configuración de Ordenamiento
            const sort = state.sortConfig();
            const orderArg = sort.direction
              ? [{ [sort.active]: sort.direction.toUpperCase() }]
              : [];

            // 2. Definición del filtro para HotChocolate
            const whereArg =
              params.search && params.search.trim() !== ''
                ? { title: { contains: params.search } }
                : undefined;

            const graphQlVariables = { ...params };
            delete (graphQlVariables as any).search;

            return graphqlService
              .getProducts({
                ...graphQlVariables,
                where: whereArg,
                order: orderArg,
              })
              .pipe(
                tap((res) => {
                  patchState(state, {
                    items: res.items,
                    totalItems: res.totalItems,
                    hasNextPage: res.hasNextPage,
                    startCursor: res.startCursor,
                    endCursor: res.endCursor,
                    loading: false,
                    // Mantenemos el valor de búsqueda en el estado del Store
                    filterQuery: params.search !== undefined ? params.search : state.filterQuery(),
                  });
                }),
                catchError(() => {
                  patchState(state, { loading: false });
                  return EMPTY;
                }),
              );
          }),
        ),
      ), */

      updateSort: (sort: Sort) => patchState(state, { sortConfig: sort }),

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

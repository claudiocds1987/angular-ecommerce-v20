/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY, debounceTime, distinctUntilChanged } from 'rxjs'; // Importamos 'map'

import { computed } from '@angular/core';
import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../../../shared/services/product-service';
import { ProductBrand } from '../../../shared/models/product-brand.model';
import { ProductCategory } from '../../../shared/models/product-category.model';
import { BrandService } from '../../../shared/services/brand-service';
import { CategoryService } from '../../../shared/services/category-service';
import { ProductFilterData } from '../../../shared/models/product-filter-data.model';

// * Usando forma moderna "NgRX Signal Store" en lugar de NgRx, para manejar el estado de productos en el admin
// * rxMethod es la forma estándar en el Signal Store porque gestiona automáticamente el ciclo de vida de las suscripciones.
//   Permite usar operadores de RxJS sin preocuparme por fugas de memoria, manteniendo el código limpio y declarativo.)
// * patchState: Actualiza de forma parcial, inmutable y reactiva el estado, fusionando solo los cambios enviados.
//   ATOMICIDAD: Si cambias varias propiedades a la vez (ej. loading y error), la UI solo se actualiza una vez (evita renders innecesarios).

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as Product[],
    brands: [] as ProductBrand[],
    categories: [] as ProductCategory[],
    totalItems: 0,
    filterQuery: '',
    loading: false,
  }),

  // UNIFICAMOS LOS COMPUTED PARA MAYOR CLARIDAD
  withComputed((state) => ({
    // Mapeo completo de Marcas: { 1: {id: 1, name: 'Apple'}, ... }
    brandMap: computed(() =>
      state.brands().reduce(
        (accumulator, brand) => {
          accumulator[brand.id] = brand; // Guardamos el objeto completo 'brand'
          return accumulator;
        },
        {} as Record<number, ProductBrand>,
      ),
    ),

    // Mapeo completo de Categorías: { 1: {id: 1, name: 'Beauty'}, ... }
    categoryMap: computed(() =>
      state.categories().reduce(
        (accumulator, category) => {
          accumulator[category.id] = category; // Guardamos el objeto completo 'category'
          return accumulator;
        },
        {} as Record<number, ProductCategory>,
      ),
    ),

    filteredProducts: computed(() => {
      const query = state.filterQuery().toLowerCase();
      return state.items().filter((p) => p.title.toLowerCase().includes(query));
    }),
    productsCount: computed(() => state.items().length),
  })),

  withMethods(
    (
      state,
      // Mantenemos la inyección aquí, que es la forma correcta en las últimas versiones
      productService = inject(ProductService),
      brandService = inject(BrandService),
      categoryService = inject(CategoryService),
    ) => ({
      loadBrands: rxMethod<void>(
        pipe(
          switchMap(() =>
            brandService.getBrands().pipe(
              tap((brands) => patchState(state, { brands })),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),

      loadCategories: rxMethod<void>(
        pipe(
          switchMap(() =>
            categoryService.getCategories().pipe(
              tap((categories) => patchState(state, { categories })),
              catchError(() => EMPTY),
            ),
          ),
        ),
      ),

      updateQuery: (query: string) => patchState(state, { filterQuery: query }),

      removeProduct: (id: number) => {
        // Aca  agregar una llamada al servicio para dar de baja (que no lo elimine) el producto del backend antes de actualizar el estado localmente
        patchState(state, { items: state.items().filter((p) => p.id !== id) });
      },

      // Función para buscar productos con filtros.
      searchProducts: rxMethod<{ filters: ProductFilterData; page: number; size: number }>(
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
    }),
  ),

  // CARGA AUTOMÁTICA AL INICIAR
  withHooks({
    onInit(store) {
      store.loadBrands();
      store.loadCategories();
    },
  }),
);

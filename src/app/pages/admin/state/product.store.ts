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
    // Crea mapa: { 1: 'Calvin Klein', 2: 'Essence', ... }
    brandMap: computed(() =>
      state.brands().reduce(
        (acc, b) => {
          acc[b.id] = b.name;
          return acc;
        },
        {} as Record<number, string>,
      ),
    ),
    // Crea un mapa: { 1: 'Beauty', 2: 'Fragrances', ... }
    categoryMap: computed(() =>
      state.categories().reduce(
        (acc, c) => {
          acc[c.id] = c.name;
          return acc;
        },
        {} as Record<number, string>,
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
        patchState(state, { items: state.items().filter((p) => p.id !== id) });
      },

      searchProducts: rxMethod<{ query: string; page: number; size: number }>(
        pipe(
          debounceTime(300),
          distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
          tap(({ query }) => patchState(state, { filterQuery: query, loading: true })),
          switchMap(({ query, page, size }) =>
            productService.getFilteredProducts(page, size, query).pipe(
              tap((res) => {
                patchState(state, {
                  items: page === 1 ? res.items : [...state.items(), ...res.items],
                  totalItems: res.totalItems,
                  loading: false,
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

/* export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState({
    items: [] as Product[],
    filterQuery: '',
    loading: false,
  }),

  // SELECTORES COMPUTADOS
  withComputed((state) => ({
    filteredProducts: computed(() => {
      const query = state.filterQuery().toLowerCase();
      return state.items().filter((p) => p.title.toLowerCase().includes(query));
    }),
    productsCount: computed(() => state.items().length),
  })),

  withMethods((state, http = inject(HttpClient)) => ({
    // Método para actualizar el texto de búsqueda
    updateQuery: (query: string) => patchState(state, { filterQuery: query }),

    // Método para eliminar un producto localmente
    removeProduct: (id: number) => {
      const updatedItems = state.items().filter((p) => p.id !== id);
      patchState(state, { items: updatedItems });
    },

    // Método para buscar productos
    searchProducts: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(), // No dispara si el texto es el mismo que el anterior
        tap((query) => patchState(state, { filterQuery: query, loading: true })),
        switchMap((query) =>
          http.get<{ products: any[] }>(`https://dummyjson.com/products/search?q=${query}`).pipe(
            map(({ products }) => products.map((p) => ({ ...p, image: p.thumbnail }))),
            tap((mappedProducts) => patchState(state, { items: mappedProducts, loading: false })),
            catchError(() => {
              patchState(state, { loading: false });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    // Método para cargar productos con mapeo
    loadAllProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(state, { loading: true })),
        switchMap(() =>
          // en vez de la url mejor usar productService.getAll()
          http.get<{ products: DummyProduct[] }>('https://dummyjson.com/products').pipe(
            // Mapeamos los datos de la API a nuestra interfaz Product
            map(({ products }) =>
              products.map((product) => ({
                ...product,
                image: product.thumbnail,
              })),
            ),
            tap((mappedProducts) => patchState(state, { items: mappedProducts, loading: false })),
            catchError((error) => {
              console.error('Error cargando productos:', error);
              patchState(state, { loading: false });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),
  })),
);
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  pipe,
  switchMap,
  tap,
  catchError,
  map,
  EMPTY,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs'; // Importamos 'map'
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';
import { Product } from '../../../shared/models/product.model';
import { DummyProduct } from '../../../shared/models/dummy-response.model';

// * Usando forma moderna "NgRX Signal Store" en lugar de NgRx, para manejar el estado de productos en el admin
// * rxMethod es la forma estándar en el Signal Store porque gestiona automáticamente el ciclo de vida de las suscripciones.
//   Permite usar operadores de RxJS sin preocuparme por fugas de memoria, manteniendo el código limpio y declarativo.)
// * patchState: Actualiza de forma parcial, inmutable y reactiva el estado, fusionando solo los cambios enviados.
//   ATOMICIDAD: Si cambias varias propiedades a la vez (ej. loading y error), la UI solo se actualiza una vez (evita renders innecesarios).

export const ProductStore = signalStore(
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

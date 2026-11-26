import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { MyPurchaseItem, MyPurchasesFilters } from '../models/purchase.model';
import { PurchaseService } from '../services/purchase-service';

export interface PurchasesState {
  items: MyPurchaseItem[];
  filters: MyPurchasesFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: PurchasesState = {
  items: [],
  filters: {
    dateFrom: null,
    dateTo: null,
    categoryId: null,
    search: null,
  },
  isLoading: false,
  error: null,
};

export const PurchasesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ items, filters }) => ({
    totalItems: computed(() => items().length),
    isEmpty: computed(() => items().length === 0),
    hasActiveFilters: computed(() => {
      const current = filters();
      return Boolean(
        current.dateFrom ||
        current.dateTo ||
        current.categoryId ||
        (current.search && current.search.trim().length > 0),
      );
    }),
  })),

  withMethods((store, purchaseService = inject(PurchaseService)) => {
    // Carga las compras combinando el userId recibido y los filtros activos en el store.
    // switchMap cancela peticiones anteriores en curso si el usuario cambia de filtro rápido.
    const loadMyPurchases = rxMethod<{
      userId: number;
      filters?: MyPurchasesFilters;
    }>(
      pipe(
        tap(({ filters }) => {
          patchState(store, {
            isLoading: true,
            error: null,
            ...(filters ? { filters: { ...store.filters(), ...filters } } : {}),
          });
        }),
        switchMap(({ userId }) =>
          purchaseService.getMyPurchases(userId, store.filters()).pipe(
            tap((items) => {
              patchState(store, {
                items,
                isLoading: false,
                error: null,
              });
            }),
            catchError((err: HttpErrorResponse) => {
              const errorMessage =
                err.error?.message || 'No se pudieron cargar tus compras. Intentá nuevamente.';
              patchState(store, {
                items: [],
                isLoading: false,
                error: errorMessage,
              });
              return of([]);
            }),
          ),
        ),
      ),
    );

    return {
      loadMyPurchases,
      // Actualiza uno o varios filtros y dispara automáticamente la recarga.
      updateFilters(userId: number, newFilters: Partial<MyPurchasesFilters>): void {
        loadMyPurchases({
          userId,
          filters: { ...store.filters(), ...newFilters },
        });
      },

      // Limpia todos los filtros activos y vuelve a traer el historial completo.
      resetFilters(userId: number): void {
        const clearedFilters: MyPurchasesFilters = {
          dateFrom: null,
          dateTo: null,
          categoryId: null,
          search: null,
        };
        patchState(store, { filters: clearedFilters });
        loadMyPurchases({ userId, filters: clearedFilters });
      },

      //Limpia el store (útil al cerrar sesión).
      clearStore(): void {
        patchState(store, initialState);
      },
    };
  }),
);

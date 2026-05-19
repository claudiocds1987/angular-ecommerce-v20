import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { firstValueFrom, pipe, switchMap, tap, catchError, of } from 'rxjs'; // Añadimos catchError y of
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { User } from '../../../shared/models/user.model';
import { environment } from '../../../../environments/environment';
import { CartService } from '../../../shared/services/cart-service';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  withMethods((state, http = inject(HttpClient), router = inject(Router)) => {
    const apiUrl = `${environment.serverUrl}/api/auth`;
    const cartService = inject(CartService);

    return {
      // --- FUNCIÓN AGREGADA: Permite limpiar el error desde los componentes ---
      clearError: () => {
        patchState(state, { error: null });
      },

      initializeAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          patchState(state, { loading: true });
          const user = await firstValueFrom(http.get<User>(`${apiUrl}/me`));
          patchState(state, { user, loading: false });
        } catch {
          localStorage.removeItem('token');
          patchState(state, { user: null, loading: false });
        }
      },

      // Método login corregido para que no muera tras el primer error
      login: rxMethod<{ username: string; password: string }>(
        pipe(
          tap(() => patchState(state, { loading: true, error: null })),
          switchMap((credentials) =>
            http.post<User>(`${apiUrl}/login`, credentials).pipe(
              tap((user: User) => {
                // ÉXITO
                patchState(state, { user, loading: false });

                if (user.token) {
                  localStorage.setItem('token', user.token);
                }

                if (user.role === 'admin') {
                  router.navigate(['/admin']);
                } else {
                  router.navigate(['/']);
                }
              }),
              // ¡LA CLAVE AQUÍ!: Usamos catchError dentro del pipe interno del HTTP post
              // Esto intercepta el error y evita que mate la corriente del switchMap padre.
              catchError((err: HttpErrorResponse) => {
                console.error('Error de login:', err);
                const errorMessage = err.error?.message || 'Usuario o contraseña incorrectos';

                // Aplicamos el estado de error
                patchState(state, { error: errorMessage, loading: false });

                // Retornamos un observable vacío (of(null)) para mantener vivo el flujo de datos
                return of(null);
              }),
            ),
          ),
        ),
      ),

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('shopping_cart');
        cartService.cart.set([]);
        patchState(state, { user: null });
        router.navigate(['/login']);
      },
    };
  }),
);

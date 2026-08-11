import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { firstValueFrom, pipe, switchMap, tap, catchError, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { User } from '@features/auth/models/user.model';
import { environment } from '@env/environment';
import { CartService } from '@features/checkout/services/cart-service';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  // INYECTAMOS PLATFORM_ID AQUÍ ARRIBA, junto con los demás servicios
  withMethods(
    (
      state,
      http = inject(HttpClient),
      router = inject(Router),
      platformId = inject(PLATFORM_ID), // <--- ¡Aquí mismo es seguro!
    ) => {
      const apiUrl = `${environment.serverUrl}/api/auth`;
      const cartService = inject(CartService);

      return {
        clearError: () => {
          patchState(state, { error: null });
        },

        initializeAuth: async () => {
          if (!isPlatformBrowser(platformId)) return;

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

        login: rxMethod<{ username: string; password: string }>(
          pipe(
            tap(() => patchState(state, { loading: true, error: null })),
            switchMap((credentials) =>
              http.post<User>(`${apiUrl}/login`, credentials).pipe(
                tap((user: User) => {
                  // ÉXITO
                  patchState(state, { user, loading: false });

                  // Usamos la variable platformId que ya inyectamos de forma segura arriba
                  if (user.token && isPlatformBrowser(platformId)) {
                    localStorage.setItem('token', user.token);
                  }

                  if (user.role === 'admin') {
                    router.navigate(['/admin']);
                  } else {
                    router.navigate(['/']);
                  }
                }),
                catchError((err: HttpErrorResponse) => {
                  console.error('Error de login:', err);
                  const errorMessage = err.error?.message || 'Usuario o contraseña incorrectos';
                  patchState(state, { error: errorMessage, loading: false });
                  return of(null);
                }),
              ),
            ),
          ),
        ),

        logout: () => {
          if (isPlatformBrowser(platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('shopping_cart');
          }
          cartService.cart.set([]);
          patchState(state, { user: null });
          router.navigate(['/login']);
        },
      };
    },
  ),
);

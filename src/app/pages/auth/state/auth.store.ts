// src/app/pages/auth/+state/auth.store.ts
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { firstValueFrom, pipe, switchMap, tap } from 'rxjs';
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
      // --- "initializeAuth": PARA NO PERDER LOS DATOS DEL USUARIO AL REFRESCAR (F5) ---
      // 1. Revisa si hay una "llave" (token) guardada en el navegador.
      // 2. Si la encuentra, le pregunta al servidor: "¿A quién le pertenece esta llave?".
      // 3. El servidor responde con los datos del usuario (nombre, rol, etc.) y los guarda en el Store.
      // 4. Si la llave no sirve (venció), limpia todo para seguridad.
      initializeAuth: async () => {
        const token = localStorage.getItem('token');
        // Si no hay token, no hacemos nada, el estado queda en null
        if (!token) return;

        try {
          patchState(state, { loading: true });
          // Llamamos al endpoint Auth/me del backend
          const user = await firstValueFrom(http.get<User>(`${apiUrl}/me`));
          // Llenamos el Store con los datos frescos (incluyendo el rol)
          patchState(state, { user, loading: false });
        } catch {
          // Si el token expiró o es inválido, limpiamos todo
          localStorage.removeItem('token');
          patchState(state, { user: null, loading: false });
        }
      },

      // Método login
      login: rxMethod<{ username: string; password: string }>(
        pipe(
          tap(() => patchState(state, { loading: true, error: null })),
          switchMap((credentials) =>
            http.post<User>(`${apiUrl}/login`, credentials).pipe(
              tap({
                next: (user: User) => {
                  // 1. Guardamos el usuario en el estado
                  patchState(state, { user, loading: false });

                  // 2. Guardamos el token del backend en el localStorage
                  if (user.token) {
                    localStorage.setItem('token', user.token);
                  }

                  // 3. Redirección basada en el rol que viene de la DB
                  if (user.role === 'admin') {
                    router.navigate(['/admin']);
                  } else {
                    router.navigate(['/']);
                  }
                },
                error: (err: HttpErrorResponse) => {
                  console.error('Error de login:', err);
                  // Capturamos el mensaje de error del backend (BadRequest/Unauthorized)
                  const errorMessage = err.error?.message || 'Usuario o contraseña incorrectos';
                  patchState(state, { error: errorMessage, loading: false });
                },
              }),
            ),
          ),
        ),
      ),

      // Método para cerrar sesión
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('shopping_cart');
        cartService.cart.set([]);
        patchState(state, { user: null });
        router.navigate(['/login']);
      },

      // MOCK En el rxMethod de login
      /* login: rxMethod<{ username: string; password: string }>(
        pipe(
            tap(() => patchState(state, { loading: true })),
            // 💡 Simulamos un retraso de red de 1 segundo
            delay(1000), 
            tap(() => {
            const mockUser = {
                id: 1,
                username: 'claudio_dev',
                token: 'fake-jwt-token-123' // El token que "recibiría" del backend CON LIBRERIA JWT
            };
            
            patchState(state, { user: mockUser, loading: false });
            localStorage.setItem('token', mockUser.token);
            router.navigate(['/admin']);
            })
        )
        ), */
    };
  }),
);

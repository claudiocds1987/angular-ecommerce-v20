// src/app/pages/auth/+state/auth.store.ts
import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../../shared/models/user.model';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({
    user: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  withMethods((state, http = inject(HttpClient), router = inject(Router)) => ({
    // rxMethod es la forma estándar en el Signal Store porque gestiona automáticamente el ciclo de vida de las suscripciones. Me permite usar operadores de RxJS sin preocuparme por fugas de memoria, manteniendo el código limpio y declarativo.)

    // Método para manejar el login
    login: rxMethod<{ username: string; password: string }>(
      pipe(
        tap(() => patchState(state, { loading: true, error: null })),
        switchMap((credentials) =>
          http.post<User>('https://acaMonsterApp/auth/login', credentials).pipe(
            tap((user) => {
              // Guardamos el usuario en el estado
              patchState(state, { user, loading: false });
              // Guardamos el token en localStorage para persistencia
              localStorage.setItem('token', user.token || '');
              // Navegamos al admin tras el éxito
              router.navigate(['/admin']);
            }),
            catchError(() => {
              patchState(state, {
                loading: false,
                error: 'Credenciales inválidas',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    logout: () => {
      localStorage.removeItem('token');
      patchState(state, { user: null });
      router.navigate(['/']);
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
  })),
);

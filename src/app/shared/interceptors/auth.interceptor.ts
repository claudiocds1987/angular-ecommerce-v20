import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../pages/auth/state/auth.store';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  // 1. Obtenemos el token del localStorage
  const token = localStorage.getItem('token');

  // Solo agregamos el token si la URL apunta a nuestro backend
  // Esto evita enviar el token accidentalmente a Mercado Pago u otras APIs externas
  const isApiUrl = req.url.startsWith(environment.serverUrl);

  // 2. Si existe el token, clonamos la petición y agregamos el header
  let authReq = req;
  if (token && isApiUrl) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // para simular error descomentar el siguiente bloque y comentar paso 3
  /* return throwError(
    () =>
      new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
      }),
  ).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        alert('Sesión expirada o token inválido. Redirigiendo...');

        // Limpiamos el estado del usuario y el localStorage
        authStore.logout();

        // Redirigimos al login
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  ); */

  // 3. Agregamos el pipe para escuchar la respuesta y capturar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde con 401 (Unauthorized)
      if (error.status === 401 && isApiUrl) {
        // Limpiamos el estado del usuario (User = null) y el localStorage (Token)
        authStore.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};

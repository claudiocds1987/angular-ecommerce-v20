// src/app/shared/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../pages/auth/state/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();

  // 1. Si no hay usuario, al login
  if (!authStore.user()) {
    return router.createUrlTree(['/login']);
  }

  // 2. Si intenta entrar a /admin pero NO es admin, lo mandamos al home
  if (state.url.startsWith('/admin') && user?.role !== 'admin') {
    console.warn('Acceso denegado: Se requiere rol de administrador');
    return router.createUrlTree(['/']);
  }

  return true;
};

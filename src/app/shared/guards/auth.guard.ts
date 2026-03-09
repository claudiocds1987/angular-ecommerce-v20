// src/app/shared/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../pages/auth/state/auth.store';

export const authGuard = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  // Si hay usuario logueado o token en localStorage, permitimos
  if (authStore.user() || localStorage.getItem('token')) {
    return true;
  }

  // Si no, mandamos al login
  router.navigate(['/login']);
  return false;
};

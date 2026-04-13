import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../pages/auth/state/auth.store';

export const authGuard: CanActivateFn = (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();

  // 1. Si no hay usuario en el Store tras la inicialización, redirigir al login
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // 2. Validación de Rol para rutas de administración
  // Usamos state.url para verificar si el destino es admin
  const isAdminPath = state.url.includes('/admin');

  if (isAdminPath && user.role !== 'admin') {
    console.warn(
      `Acceso denegado: El usuario ${user.username} no tiene permisos de administrador.`,
    );
    return router.createUrlTree(['/']); // Redirigir al Home o una página de 403
  }

  return true;
};

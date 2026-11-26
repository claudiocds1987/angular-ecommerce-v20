import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@features/auth/state/auth.store';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);
    const user = authStore.user();
    // Sin sesión activa -> redirige al login
    if (!user) {
      return router.createUrlTree(['/login']);
    }

    // Rol no permitido (ej usuario invitado si tipea en url /my-purchases) -> redirige a home o página de acceso denegado
    if (!allowedRoles.includes(user.role)) {
      return router.createUrlTree(['/']);
    }

    return true;
  };
};

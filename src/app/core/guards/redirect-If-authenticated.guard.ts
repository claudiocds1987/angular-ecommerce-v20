import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@features/auth/state/auth.store';

export const redirectIfAuthenticatedGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();

  // Si el usuario ya inició sesión, ejecutamos la estrategia de redirección por rol
  if (user) {
    console.log('usuario logeado: ', user);
    if (user.role === 'admin') {
      router.navigate(['/admin'], { replaceUrl: true });
      return false; // Cancelamos la navegación actual hacia el login porque ya redirigimos
    }

    // Si es un usuario comprador (customer) o cualquier otro rol no admin, va a la lista de productos
    router.navigate(['/'], { replaceUrl: true });
    return false;
  }

  // Si no está logueado, puede entrar a la pantalla de login sin problemas
  return true;
};

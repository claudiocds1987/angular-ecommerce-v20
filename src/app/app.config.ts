/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
  provideAppInitializer, // <--- Nueva función para inicialización
} from '@angular/core';

import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { environment } from '@env/environment';
import { AuthStore } from '@features/auth/state/auth.store';

/**
 * Equivalente moderno de `lara-light-blue` (PrimeNG ≤17 usaba CSS en angular.json).
 * En PrimeNG 20 los temas se configuran por presets (Lara, Aura, Material, Nora).
 * Para cambiar el look: importa Aura/Material/Nora o ajusta `primary` abajo.
 */
const LaraLightBlue = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: LaraLightBlue,
        options: {
          darkModeSelector: false,
        },
      },
    }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([authInterceptor])),

    // "provideAppInitializer" para volver a cargar los datos del usuario que se perdieron al refrescar la página (F5).
    // Evita que el sistema nos eche al login al perderse el estado temporal.
    provideAppInitializer(() => {
      const authStore = inject(AuthStore);
      return authStore.initializeAuth();
    }),

    // Configuracion Apollo para graphql
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({
          uri: `${environment.serverUrl}/graphql`,
        }),
        cache: new InMemoryCache(),
      };
    }),
  ],
};

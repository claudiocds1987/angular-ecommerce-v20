/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
  provideAppInitializer, // <--- Nueva función para inicialización
} from '@angular/core';

import { provideRouter, withHashLocation } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './shared/interceptors/auth.interceptor';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { environment } from '../environments/environment';
import { AuthStore } from './pages/auth/state/auth.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
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

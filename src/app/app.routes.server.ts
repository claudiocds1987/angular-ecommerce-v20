import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas de administración y autenticación (renderizadas únicamente en el cliente)
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: 'cart',
    renderMode: RenderMode.Client,
  },
  {
    path: 'payment-result',
    renderMode: RenderMode.Client,
  },
  {
    path: 'product-detail/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'primeng-smoke',
    renderMode: RenderMode.Client,
  },
  // Catálogo público principal: Pre-renderizado en build (SSG) con soporte de hidratación
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];

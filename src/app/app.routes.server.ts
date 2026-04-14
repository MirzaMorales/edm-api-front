import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas de autenticación — modo cliente
  {
    path: 'auth/**',
    renderMode: RenderMode.Client
  },
  // Rutas de tareas — modo cliente
  {
    path: 'tasks',
    renderMode: RenderMode.Client
  },
  {
    path: 'tasks/**',
    renderMode: RenderMode.Client
  },
  // Rutas de usuarios — modo cliente
  {
    path: 'users',
    renderMode: RenderMode.Client
  },
  {
    path: 'users/**',
    renderMode: RenderMode.Client
  },
  // Perfil de usuario — modo cliente
  {
    path: 'profile',
    renderMode: RenderMode.Client
  },
  // Ruta por defecto
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

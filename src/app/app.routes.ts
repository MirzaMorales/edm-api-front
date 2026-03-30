import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // 1. Redirección inicial: Al entrar al sitio, ve directo al login
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },

  // 2. Rutas de Autenticación (Lazy Loading)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // 3. Rutas Privadas (Protegidas por tu Guard)
  // {
  //   path: 'tasks',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./features/tasks/tasks.routes').then(m => m.TASKS_ROUTES)
  // },

  // 4. Comodín: Si la ruta no existe, regresa al login
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
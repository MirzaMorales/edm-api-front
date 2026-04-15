import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './shared/components/main-layout/main-layout';

export const routes: Routes = [
  // 1. Redirección inicial: Al entrar al sitio, ve directo a las tareas (el guard protegerá si no hay login)
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },

  // 2. Rutas de Autenticación (Lazy Loading)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // 3. Rutas Privadas (Protegidas por tu Guard y estructuradas con Layout)
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'tasks',
        loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/users/user-profile/user-profile').then(m => m.UserProfileComponent)
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./features/users/user-form/user-form').then(m => m.UserForm)
      }
    ]
  },

  // 4. Comodín: Si la ruta no existe, regresa a tareas (o login si no autorizado)
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
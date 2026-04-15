import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clonamos la petición para incluir withCredentials: true
  // Esto permite que el navegador envíe automáticamente las cookies HttpOnly
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 (no autorizado / cookie expirada),
      // redirigimos al login y limpiamos bandera local
      if (error.status === 401) {
        localStorage.removeItem('is_auth');
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};
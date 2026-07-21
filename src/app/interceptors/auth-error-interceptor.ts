import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const estRequeteAuth = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!estRequeteAuth && (error.status === 401 || error.status === 403)) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { sessionExpiree: true } });
      }
      return throwError(() => error);
    })
  );
};

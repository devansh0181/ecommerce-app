import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = error.error?.message || `Error Code: ${error.status}`;

        if (error.status === 401) {
          authService.logout();
          router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          console.error('Access forbidden:', errorMessage);
        } else if (error.status === 404) {
          console.error('Resource not found:', errorMessage);
        } else if (error.status === 500) {
          console.error('Server error:', errorMessage);
        }
      }

      console.error('HTTP Error:', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};

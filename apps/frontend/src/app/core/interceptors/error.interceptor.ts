import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = error.error?.message || `Error Code: ${error.status}`;

          // Handle specific error codes
          if (error.status === 401) {
            // Unauthorized - token expired or invalid
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else if (error.status === 403) {
            // Forbidden
            console.error('Access forbidden:', errorMessage);
          } else if (error.status === 404) {
            // Not found
            console.error('Resource not found:', errorMessage);
          } else if (error.status === 500) {
            // Server error
            console.error('Server error:', errorMessage);
          }
        }

        console.error('HTTP Error:', errorMessage, error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}


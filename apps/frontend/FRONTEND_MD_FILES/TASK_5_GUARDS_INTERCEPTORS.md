# TASK 5: Guards & Interceptors Implementation

## 🎯 Objective
Create JWT Auth Guard, Role Guard, Auth Interceptor, and Error Interceptor.

## 📍 Location
Create files in: `apps/frontend/src/app/core/guards/` and `src/app/core/interceptors/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create all 4 security files:
2 guards (jwt-auth.guard.ts, role.guard.ts) and 2 interceptors (auth.interceptor.ts, error.interceptor.ts)."
```

---

## 📝 FILE 1: jwt-auth.guard.ts

**Path:** `src/app/core/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class JwtAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    // Not logged in, redirect to login
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }
}
```

---

## 📝 FILE 2: role.guard.ts

**Path:** `src/app/core/guards/role.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['roles'] as string[];

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const userRole = this.authService.getCurrentUser()?.role;

    if (!userRole) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (requiredRoles.includes(userRole)) {
      return true;
    }

    // Role not authorized, redirect to home or unauthorized page
    this.router.navigate(['/']);
    return false;
  }
}
```

---

## 📝 FILE 3: auth.interceptor.ts

**Path:** `src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get token from auth service
    const token = this.authService.getToken();

    // Clone request and add authorization header if token exists
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }
}
```

---

## 📝 FILE 4: error.interceptor.ts

**Path:** `src/app/core/interceptors/error.interceptor.ts`

```typescript
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
```

---

## 📝 FILE 5: Create index.ts for guards

**Path:** `src/app/core/guards/index.ts`

```typescript
export * from './jwt-auth.guard';
export * from './role.guard';
```

---

## 📝 FILE 6: Create index.ts for interceptors

**Path:** `src/app/core/interceptors/index.ts`

```typescript
export * from './auth.interceptor';
export * from './error.interceptor';
```

---

## ✅ Verification Checklist

After Copilot completes this task:

- [ ] `jwt-auth.guard.ts` created - protects routes requiring login
- [ ] `role.guard.ts` created - protects routes requiring specific roles
- [ ] `auth.interceptor.ts` created - adds Authorization header to requests
- [ ] `error.interceptor.ts` created - handles HTTP errors globally
- [ ] Guards/index.ts created for barrel exports
- [ ] Interceptors/index.ts created for barrel exports
- [ ] No compilation errors

---

## 🎯 How to Use These

In routing configuration:
```typescript
{
  path: 'customer',
  canActivate: [JwtAuthGuard, RoleGuard],
  data: { roles: ['CUSTOMER'] },
  component: CustomerComponent
}
```

---

## 🚨 Important Notes

1. **Guards are already in CoreModule** - Task 1 added them to providers
2. **Interceptors are already in CoreModule** - Task 1 configured them
3. **Authorization header format:** `Bearer <token>`
4. **Error handling:** 401 = logout, others = log and continue
5. **Roles:** Compare with route.data['roles'] array

---

## 🎯 Next Step

After this task completes:
1. Verify no compilation errors: `ng serve`
2. Proceed to **TASK_6_SHARED_COMPONENTS_1.md**

---

**Status: Ready for Copilot Agent Mode ✅**

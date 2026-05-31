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

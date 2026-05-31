# TASK 8: Routing & App Setup

## 🎯 Objective
Wire everything together: configure routes, update app component, set up modules, and prepare for features.

## 📍 Location
Update files in: `apps/frontend/src/app/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Update routing configuration, app component, and module setup.
Create auth, customer, and barber route files. Update app.ts to use the new configuration."
```

---

## 📝 FILE 1: app.routes.ts

**Path:** `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { JwtAuthGuard, RoleGuard } from '@core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'customer',
    canActivate: [JwtAuthGuard, RoleGuard],
    data: { roles: ['CUSTOMER'] },
    loadChildren: () => import('./features/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
  },
  {
    path: 'barber',
    canActivate: [JwtAuthGuard, RoleGuard],
    data: { roles: ['BARBER'] },
    loadChildren: () => import('./features/barber/barber.routes').then((m) => m.BARBER_ROUTES),
  },
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
```

---

## 📝 FILE 2: auth.routes.ts

**Path:** `src/app/features/auth/auth.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
];
```

---

## 📝 FILE 3: customer.routes.ts

**Path:** `src/app/features/customer/customer.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'salons',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/salons/salon-list/salon-list.component').then((m) => m.SalonListComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/salons/salon-detail/salon-detail.component').then((m) => m.SalonDetailComponent),
          },
        ],
      },
      {
        path: 'bookings',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/bookings/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/bookings/booking-detail/booking-detail.component').then((m) => m.BookingDetailComponent),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
];
```

---

## 📝 FILE 4: barber.routes.ts

**Path:** `src/app/features/barber/barber.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { BarberLayoutComponent } from './layouts/barber-layout/barber-layout.component';

export const BARBER_ROUTES: Routes = [
  {
    path: '',
    component: BarberLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'bookings',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/bookings/booking-requests/booking-requests.component').then((m) => m.BookingRequestsComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/bookings/booking-detail/booking-detail.component').then((m) => m.BookingDetailComponent),
          },
        ],
      },
      {
        path: 'queue',
        loadComponent: () => import('./pages/bookings/queue-view/queue-view.component').then((m) => m.QueueViewComponent),
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/services/service-list/service-list.component').then((m) => m.ServiceListComponent),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/salon-profile/salon-profile.component').then((m) => m.SalonProfileComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];
```

---

## 📝 FILE 5: app.ts (Main Component)

**Path:** `src/app/app.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent, FooterComponent, ToastContainerComponent } from '@shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent],
  template: `
    <div class="app-wrapper">
      <app-navbar></app-navbar>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      
      <app-footer></app-footer>
      
      <app-toast-container></app-toast-container>
    </div>
  `,
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  title = 'QueueCut';

  constructor() {}

  ngOnInit(): void {
    console.log('QueueCut App Initialized');
  }
}
```

---

## 📝 FILE 6: app.scss

**Path:** `src/app/app.scss`

```scss
@import './styles/variables';
@import './styles/mixins';

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: $bg-secondary;
}

.app-main {
  flex: 1;
  padding: $spacing-lg;

  @include md {
    padding: $spacing-xl;
  }

  @include lg {
    padding: $spacing-2xl;
  }
}

// Loading state
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

// Error state
.app-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: $color-text;
}
```

---

## 📝 FILE 7: Update main.ts

**Path:** `src/main.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app';
import { CoreModule } from './app/core/core.module';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
```

---

## 📝 FILE 8: Create placeholder feature pages

**Create empty placeholder components for now:**

Create these files with basic structure:

**Path:** `src/app/features/auth/pages/login/login.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `<h1>Login Page - Coming Soon</h1>`,
})
export class LoginComponent {}
```

**Path:** `src/app/features/auth/pages/register/register.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  template: `<h1>Register Page - Coming Soon</h1>`,
})
export class RegisterComponent {}
```

**Path:** `src/app/features/customer/layouts/customer-layout/customer-layout.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class CustomerLayoutComponent {}
```

**Path:** `src/app/features/customer/pages/home/home.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  template: `<h1>Customer Home - Coming Soon</h1>`,
})
export class HomeComponent {}
```

**Path:** `src/app/features/customer/pages/salons/salon-list/salon-list.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-salon-list',
  standalone: true,
  template: `<h1>Salon List - Coming Soon</h1>`,
})
export class SalonListComponent {}
```

**Path:** `src/app/features/customer/pages/salons/salon-detail/salon-detail.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-salon-detail',
  standalone: true,
  template: `<h1>Salon Detail - Coming Soon</h1>`,
})
export class SalonDetailComponent {}
```

**Path:** `src/app/features/customer/pages/bookings/my-bookings/my-bookings.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  template: `<h1>My Bookings - Coming Soon</h1>`,
})
export class MyBookingsComponent {}
```

**Path:** `src/app/features/customer/pages/bookings/booking-detail/booking-detail.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-booking-detail',
  standalone: true,
  template: `<h1>Booking Detail - Coming Soon</h1>`,
})
export class BookingDetailComponent {}
```

**Path:** `src/app/features/customer/pages/profile/profile.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  template: `<h1>Customer Profile - Coming Soon</h1>`,
})
export class ProfileComponent {}
```

**Path:** `src/app/features/barber/layouts/barber-layout/barber-layout.component.ts`

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-barber-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class BarberLayoutComponent {}
```

**Path:** `src/app/features/barber/pages/dashboard/dashboard.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-barber-dashboard',
  standalone: true,
  template: `<h1>Barber Dashboard - Coming Soon</h1>`,
})
export class DashboardComponent {}
```

**Path:** `src/app/features/barber/pages/bookings/booking-requests/booking-requests.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  template: `<h1>Booking Requests - Coming Soon</h1>`,
})
export class BookingRequestsComponent {}
```

**Path:** `src/app/features/barber/pages/bookings/booking-detail/booking-detail.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-barber-booking-detail',
  standalone: true,
  template: `<h1>Barber Booking Detail - Coming Soon</h1>`,
})
export class BookingDetailComponent {}
```

**Path:** `src/app/features/barber/pages/bookings/queue-view/queue-view.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-queue-view',
  standalone: true,
  template: `<h1>Queue View - Coming Soon</h1>`,
})
export class QueueViewComponent {}
```

**Path:** `src/app/features/barber/pages/services/service-list/service-list.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-barber-service-list',
  standalone: true,
  template: `<h1>Service List - Coming Soon</h1>`,
})
export class ServiceListComponent {}
```

**Path:** `src/app/features/barber/pages/salon-profile/salon-profile.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-salon-profile',
  standalone: true,
  template: `<h1>Salon Profile - Coming Soon</h1>`,
})
export class SalonProfileComponent {}
```

**Path:** `src/app/features/barber/pages/settings/settings.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-barber-settings',
  standalone: true,
  template: `<h1>Settings - Coming Soon</h1>`,
})
export class SettingsComponent {}
```

---

## ✅ Verification Checklist

- [ ] app.routes.ts updated with all routes
- [ ] auth.routes.ts created
- [ ] customer.routes.ts created
- [ ] barber.routes.ts created
- [ ] app.ts updated with new structure
- [ ] app.scss created
- [ ] main.ts updated
- [ ] All placeholder components created
- [ ] Layout components created
- [ ] No compilation errors
- [ ] ng serve runs successfully

---

## 🎯 Final Verification

Run these commands:

```bash
# Build the project
ng build

# Run dev server
ng serve

# Should see:
# ✔ Compiled successfully.
# ✔ Watching for file changes...
# ✔ Application bundle generation complete.
```

---

## 🎉 Phase 7.1 Complete!

After this task, you'll have:
✅ Complete project structure
✅ Professional design system
✅ All core services
✅ Security guards & interceptors
✅ Shared components
✅ Dialog & toast system
✅ Complete routing
✅ App wired together
✅ Ready for feature development

---

## 🚀 Next Steps (Phase 7.2+)

- Build Login page (Task in Phase 7.2)
- Build Register page
- Build Salon discovery features
- Build booking system
- Build barber dashboard

---

**Status: Ready for Copilot Agent Mode ✅**

**Congratulations! Phase 7.1 Foundation Complete! 🎉**

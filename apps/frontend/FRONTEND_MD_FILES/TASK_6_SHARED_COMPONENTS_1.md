# TASK 6: Shared Components Part 1

## 🎯 Objective
Create 4 fundamental shared components: Navbar, Footer, Loading Spinner, Empty State.

## 📍 Location
Create components in: `apps/frontend/src/app/shared/components/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create 4 shared components:
1. navbar (with responsive menu)
2. footer
3. loading-spinner
4. empty-state
Include HTML, TypeScript, and SCSS for each component."
```

---

## 📝 COMPONENT 1: Navbar

**Path:** `src/app/shared/components/navbar/navbar.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User } from '@core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMenuOpen = false;
  currentUser: User | null = null;
  isCustomer = false;
  isBarber = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user) => {
      this.currentUser = user;
      this.isCustomer = this.authService.isCustomer();
      this.isBarber = this.authService.isBarber();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.closeMenu();
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeMenu();
  }
}
```

**Path:** `src/app/shared/components/navbar/navbar.component.html`

```html
<nav class="navbar">
  <div class="navbar-container">
    <!-- Logo -->
    <div class="navbar-brand">
      <a routerLink="/" class="logo">
        <span class="logo-text">QueueCut</span>
      </a>
    </div>

    <!-- Menu Toggle Button (Mobile) -->
    <button class="navbar-toggle" (click)="toggleMenu()" [class.active]="isMenuOpen">
      <span></span>
      <span></span>
      <span></span>
    </button>

    <!-- Navigation Menu -->
    <div class="navbar-menu" [class.open]="isMenuOpen">
      <div class="navbar-items">
        <!-- Customer Links -->
        <ng-container *ngIf="isCustomer">
          <a routerLink="/customer" class="nav-item" (click)="closeMenu()">Home</a>
          <a routerLink="/customer/salons" class="nav-item" (click)="closeMenu()">Salons</a>
          <a routerLink="/customer/bookings" class="nav-item" (click)="closeMenu()">My Bookings</a>
        </ng-container>

        <!-- Barber Links -->
        <ng-container *ngIf="isBarber">
          <a routerLink="/barber" class="nav-item" (click)="closeMenu()">Dashboard</a>
          <a routerLink="/barber/bookings" class="nav-item" (click)="closeMenu()">Requests</a>
          <a routerLink="/barber/queue" class="nav-item" (click)="closeMenu()">Queue</a>
          <a routerLink="/barber/services" class="nav-item" (click)="closeMenu()">Services</a>
        </ng-container>
      </div>

      <!-- User Menu -->
      <div class="navbar-right">
        <ng-container *ngIf="currentUser; else notLoggedIn">
          <div class="user-menu">
            <div class="user-avatar">
              {{ currentUser.firstName[0] }}{{ currentUser.lastName[0] }}
            </div>
            <div class="user-dropdown">
              <a routerLink="/profile" class="dropdown-item" (click)="closeMenu()">
                Profile
              </a>
              <a routerLink="/settings" class="dropdown-item" (click)="closeMenu()">
                Settings
              </a>
              <button class="dropdown-item logout-btn" (click)="logout()">
                Logout
              </button>
            </div>
          </div>
        </ng-container>

        <ng-template #notLoggedIn>
          <div class="auth-buttons">
            <a routerLink="/auth/login" class="btn btn-secondary" (click)="closeMenu()">
              Login
            </a>
            <a routerLink="/auth/register" class="btn btn-primary" (click)="closeMenu()">
              Register
            </a>
          </div>
        </ng-template>
      </div>
    </div>
  </div>
</nav>
```

**Path:** `src/app/shared/components/navbar/navbar.component.scss`

```scss
@import '../../../styles/variables';
@import '../../../styles/mixins';

.navbar {
  background: $bg-primary;
  border-bottom: 1px solid $color-border;
  position: sticky;
  top: 0;
  z-index: $z-fixed;
  box-shadow: $shadow-sm;

  .navbar-container {
    max-width: $container-2xl;
    margin: 0 auto;
    padding: 0 $spacing-lg;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  .navbar-brand {
    display: flex;
    align-items: center;

    .logo {
      font-size: $font-size-2xl;
      font-weight: $font-weight-bold;
      background: $primary-gradient;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-decoration: none;
      cursor: pointer;
      @include transition;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  .navbar-toggle {
    @include button-reset;
    display: none;
    flex-direction: column;
    gap: 6px;
    width: 28px;
    height: 24px;

    span {
      width: 100%;
      height: 2px;
      background: $color-text;
      border-radius: $border-radius-sm;
      @include transition;
    }

    &.active span {
      &:first-child {
        transform: translateY(10px) rotate(45deg);
      }
      &:nth-child(2) {
        opacity: 0;
      }
      &:last-child {
        transform: translateY(-10px) rotate(-45deg);
      }
    }

    @include md {
      display: none;
    }
  }

  .navbar-menu {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    margin-left: $spacing-2xl;

    @include md {
      margin-left: $spacing-lg;
    }

    @media (max-width: #{$breakpoint-lg - 1px}) {
      position: fixed;
      top: 70px;
      left: 0;
      right: 0;
      bottom: 0;
      background: $bg-primary;
      flex-direction: column;
      align-items: stretch;
      padding: $spacing-lg;
      gap: $spacing-lg;
      transform: translateX(-100%);
      @include transition(transform, $transition-base);

      &.open {
        transform: translateX(0);
      }

      .navbar-toggle {
        display: flex;
      }
    }
  }

  .navbar-items {
    display: flex;
    gap: $spacing-lg;

    @media (max-width: #{$breakpoint-lg - 1px}) {
      flex-direction: column;
      width: 100%;
    }

    .nav-item {
      color: $color-text;
      font-weight: $font-weight-medium;
      @include transition;
      padding: $spacing-sm $spacing-md;
      border-radius: $border-radius-md;

      &:hover {
        color: $primary-purple;
        background: rgba($primary-purple, 0.1);
      }

      &.router-link-active {
        color: $primary-purple;
        background: rgba($primary-purple, 0.1);
      }

      @media (max-width: #{$breakpoint-lg - 1px}) {
        padding: $spacing-md;
      }
    }
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: $spacing-lg;

    @media (max-width: #{$breakpoint-lg - 1px}) {
      width: 100%;
      flex-direction: column;
      margin-top: $spacing-lg;
      padding-top: $spacing-lg;
      border-top: 1px solid $color-border;
    }

    .user-menu {
      position: relative;

      .user-avatar {
        @include flex-center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: $primary-gradient;
        color: white;
        font-weight: $font-weight-bold;
        cursor: pointer;
        font-size: $font-size-sm;
      }

      .user-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: $bg-primary;
        border: 1px solid $color-border;
        border-radius: $border-radius-lg;
        min-width: 160px;
        margin-top: $spacing-sm;
        box-shadow: $shadow-lg;
        opacity: 0;
        visibility: hidden;
        @include transition;
        z-index: $z-dropdown;

        .dropdown-item {
          display: block;
          width: 100%;
          padding: $spacing-md $spacing-lg;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          color: $color-text;
          font-size: $font-size-sm;
          @include transition;

          &:hover {
            background: $bg-secondary;
            color: $primary-purple;
          }

          &.logout-btn {
            color: $danger-red;

            &:hover {
              background: lighten($danger-red, 40%);
            }
          }
        }
      }

      &:hover .user-dropdown {
        opacity: 1;
        visibility: visible;
      }
    }

    .auth-buttons {
      display: flex;
      gap: $spacing-md;

      @media (max-width: #{$breakpoint-lg - 1px}) {
        width: 100%;
        flex-direction: column;
      }
    }
  }
}
```

---

## 📝 COMPONENT 2: Footer

**Path:** `src/app/shared/components/footer/footer.component.ts`

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
```

**Path:** `src/app/shared/components/footer/footer.component.html`

```html
<footer class="footer">
  <div class="footer-container">
    <div class="footer-content">
      <div class="footer-section">
        <h4>QueueCut</h4>
        <p>Simplifying salon queue management</p>
      </div>
      <div class="footer-section">
        <h4>Quick Links</h4>
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </div>
      <div class="footer-section">
        <h4>Support</h4>
        <a href="#">Help Center</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} QueueCut. All rights reserved.</p>
    </div>
  </div>
</footer>
```

**Path:** `src/app/shared/components/footer/footer.component.scss`

```scss
@import '../../../styles/variables';

.footer {
  background: $color-dark;
  color: #fff;
  padding: $spacing-3xl $spacing-lg;
  margin-top: $spacing-3xl;

  .footer-container {
    max-width: $container-2xl;
    margin: 0 auto;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-2xl;
    margin-bottom: $spacing-2xl;

    @include md {
      grid-template-columns: 1fr;
    }

    .footer-section {
      h4 {
        font-size: $font-size-lg;
        margin-bottom: $spacing-md;
      }

      a {
        display: block;
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        margin-bottom: $spacing-sm;
        @include transition;

        &:hover {
          color: #fff;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: $spacing-lg;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: $font-size-sm;
    color: rgba(255, 255, 255, 0.6);
  }
}
```

---

## 📝 COMPONENT 3: Loading Spinner

**Path:** `src/app/shared/components/loading-spinner/loading-spinner.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class.spinner-fullscreen]="fullscreen" class="spinner-wrapper">
      <div class="spinner">
        <div class="spinner-ring"></div>
      </div>
      <p *ngIf="message" class="spinner-message">{{ message }}</p>
    </div>
  `,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {
  @Input() fullscreen = false;
  @Input() message = 'Loading...';
}
```

**Path:** `src/app/shared/components/loading-spinner/loading-spinner.component.scss`

```scss
@import '../../../styles/variables';

.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-lg;
  padding: $spacing-3xl;

  &.spinner-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: $z-modal;
  }

  .spinner {
    display: inline-block;

    .spinner-ring {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 4px solid $color-border;
      border-radius: 50%;
      border-top-color: $primary-purple;
      animation: spin 1s linear infinite;
    }
  }

  .spinner-message {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## 📝 COMPONENT 4: Empty State

**Path:** `src/app/shared/components/empty-state/empty-state.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'No data found';
  @Input() message = 'There is no data to display';
  @Input() actionText?: string;
  @Input() actionClick?: () => void;
}
```

**Path:** `src/app/shared/components/empty-state/empty-state.component.html`

```html
<div class="empty-state">
  <div class="empty-icon">{{ icon }}</div>
  <h3 class="empty-title">{{ title }}</h3>
  <p class="empty-message">{{ message }}</p>
  <button
    *ngIf="actionText && actionClick"
    class="btn btn-primary"
    (click)="actionClick()"
  >
    {{ actionText }}
  </button>
</div>
```

**Path:** `src/app/shared/components/empty-state/empty-state.component.scss`

```scss
@import '../../../styles/variables';

.empty-state {
  @include flex-col-center;
  padding: $spacing-3xl $spacing-lg;
  gap: $spacing-lg;
  text-align: center;
  border-radius: $border-radius-lg;
  background: $bg-secondary;

  .empty-icon {
    font-size: 64px;
  }

  .empty-title {
    margin: 0;
    color: $color-text;
  }

  .empty-message {
    color: $color-text-secondary;
    margin: 0;
  }
}
```

---

## 📝 FILE 5: Create index.ts

**Path:** `src/app/shared/components/index.ts`

```typescript
export * from './navbar/navbar.component';
export * from './footer/footer.component';
export * from './loading-spinner/loading-spinner.component';
export * from './empty-state/empty-state.component';
```

---

## ✅ Verification Checklist

- [ ] navbar component created (responsive menu)
- [ ] footer component created
- [ ] loading-spinner component created
- [ ] empty-state component created
- [ ] All components standalone
- [ ] All SCSS files created
- [ ] index.ts created for exports

---

## 🎯 Next Step

After this task completes:
1. Verify no compilation errors: `ng serve`
2. Proceed to **TASK_7_SHARED_COMPONENTS_2.md**

---

**Status: Ready for Copilot Agent Mode ✅**

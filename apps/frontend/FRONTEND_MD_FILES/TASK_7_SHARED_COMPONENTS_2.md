# TASK 7: Shared Components Part 2

## 🎯 Objective
Create Dialog/Modal components and Toast notification service.

## 📍 Location
Create files in: `apps/frontend/src/app/shared/components/` and `src/app/shared/services/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create:
1. confirmation-dialog component
2. error-dialog component
3. toast.service with notification support
Include all HTML, TypeScript, and SCSS files."
```

---

## 📝 COMPONENT 1: Confirmation Dialog

**Path:** `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  isDangerous: boolean;

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {
    this.title = data.title || 'Confirm';
    this.message = data.message || 'Are you sure?';
    this.confirmText = data.confirmText || 'Confirm';
    this.cancelText = data.cancelText || 'Cancel';
    this.isDangerous = data.isDangerous || false;
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
```

**Path:** `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.html`

```html
<div class="dialog-header">
  <h2 class="dialog-title">{{ title }}</h2>
</div>

<div class="dialog-body">
  <p class="dialog-message">{{ message }}</p>
</div>

<div class="dialog-footer">
  <button class="btn btn-secondary" (click)="onCancel()">
    {{ cancelText }}
  </button>
  <button
    [class.btn-danger]="isDangerous"
    [class.btn-primary]="!isDangerous"
    class="btn"
    (click)="onConfirm()"
  >
    {{ confirmText }}
  </button>
</div>
```

**Path:** `src/app/shared/components/confirmation-dialog/confirmation-dialog.component.scss`

```scss
@import '../../../styles/variables';

.dialog-header {
  padding: $spacing-xl;
  border-bottom: 1px solid $color-border;

  .dialog-title {
    margin: 0;
    font-size: $font-size-xl;
  }
}

.dialog-body {
  padding: $spacing-xl;

  .dialog-message {
    margin: 0;
    color: $color-text-secondary;
  }
}

.dialog-footer {
  padding: $spacing-xl;
  border-top: 1px solid $color-border;
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
}
```

---

## 📝 COMPONENT 2: Error Dialog

**Path:** `src/app/shared/components/error-dialog/error-dialog.component.ts`

```typescript
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ErrorDialogData {
  title?: string;
  message: string;
  error?: any;
  retryFn?: () => void;
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-dialog.component.html',
  styleUrl: './error-dialog.component.scss',
})
export class ErrorDialogComponent {
  title: string;
  message: string;
  showDetails = false;
  errorDetails: string;

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {
    this.title = data.title || 'Error';
    this.message = data.message || 'An error occurred';
    this.errorDetails = data.error?.message || JSON.stringify(data.error, null, 2);
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onRetry(): void {
    if (this.data.retryFn) {
      this.data.retryFn();
    }
    this.dialogRef.close(true);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
```

**Path:** `src/app/shared/components/error-dialog/error-dialog.component.html`

```html
<div class="dialog-header error-header">
  <span class="error-icon">⚠️</span>
  <h2 class="dialog-title">{{ title }}</h2>
</div>

<div class="dialog-body">
  <p class="dialog-message">{{ message }}</p>
  
  <button
    *ngIf="errorDetails"
    class="details-toggle"
    (click)="toggleDetails()"
  >
    {{ showDetails ? 'Hide Details' : 'Show Details' }}
  </button>

  <pre *ngIf="showDetails && errorDetails" class="error-details">{{ errorDetails }}</pre>
</div>

<div class="dialog-footer">
  <button class="btn btn-secondary" (click)="onClose()">
    Close
  </button>
  <button *ngIf="data.retryFn" class="btn btn-primary" (click)="onRetry()">
    Retry
  </button>
</div>
```

**Path:** `src/app/shared/components/error-dialog/error-dialog.component.scss`

```scss
@import '../../../styles/variables';

.dialog-header {
  padding: $spacing-xl;
  border-bottom: 1px solid $color-border;
  display: flex;
  align-items: center;
  gap: $spacing-lg;

  &.error-header {
    background: lighten($danger-red, 40%);
  }

  .error-icon {
    font-size: 24px;
  }

  .dialog-title {
    margin: 0;
    color: $danger-red;
  }
}

.dialog-body {
  padding: $spacing-xl;

  .dialog-message {
    margin: 0 0 $spacing-lg 0;
    color: $color-text-secondary;
  }

  .details-toggle {
    @include button-reset;
    color: $primary-purple;
    text-decoration: underline;
    cursor: pointer;
    font-size: $font-size-sm;
    margin-bottom: $spacing-md;

    &:hover {
      color: $primary-purple-dark;
    }
  }

  .error-details {
    background: $bg-secondary;
    padding: $spacing-lg;
    border-radius: $border-radius-md;
    font-size: $font-size-xs;
    overflow-x: auto;
    color: $color-text-secondary;
    margin: 0;
  }
}

.dialog-footer {
  padding: $spacing-xl;
  border-top: 1px solid $color-border;
  display: flex;
  gap: $spacing-md;
  justify-content: flex-end;
}
```

---

## 📝 SERVICE: Toast Notification

**Path:** `src/app/shared/services/toast.service.ts`

```typescript
import { Injectable, NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new Subject<Toast>();
  toasts$ = this.toastSubject.asObservable();
  private toasts: Toast[] = [];

  constructor(private ngZone: NgZone) {}

  // ========================================
  // TOAST METHODS
  // ========================================

  success(message: string, title: string = 'Success', duration = 3000): void {
    this.show({ title, message, type: 'success', duration });
  }

  error(message: string, title: string = 'Error', duration = 5000): void {
    this.show({ title, message, type: 'error', duration });
  }

  warning(message: string, title: string = 'Warning', duration = 4000): void {
    this.show({ title, message, type: 'warning', duration });
  }

  info(message: string, title: string = 'Info', duration = 3000): void {
    this.show({ title, message, type: 'info', duration });
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = { ...toast, id };

    this.ngZone.run(() => {
      this.toasts.push(newToast);
      this.toastSubject.next(newToast);

      if (toast.duration) {
        setTimeout(() => {
          this.remove(id);
        }, toast.duration);
      }
    });
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getToasts(): Toast[] {
    return this.toasts;
  }
}
```

---

## 📝 COMPONENT 3: Toast Container

**Path:** `src/app/shared/components/toast-container/toast-container.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '@shared/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((toast) => {
        this.toasts.push(toast);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.toastService.remove(id);
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  }
}
```

**Path:** `src/app/shared/components/toast-container/toast-container.component.html`

```html
<div class="toast-container">
  <div *ngFor="let toast of toasts" class="toast" [class]="'toast-' + toast.type">
    <div class="toast-icon">{{ getToastIcon(toast.type) }}</div>
    <div class="toast-content">
      <div class="toast-title">{{ toast.title }}</div>
      <div class="toast-message">{{ toast.message }}</div>
    </div>
    <button class="toast-close" (click)="removeToast(toast.id)">×</button>
  </div>
</div>
```

**Path:** `src/app/shared/components/toast-container/toast-container.component.scss`

```scss
@import '../../../styles/variables';
@import '../../../styles/mixins';

.toast-container {
  position: fixed;
  top: $spacing-lg;
  right: $spacing-lg;
  z-index: $z-tooltip;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  pointer-events: none;

  @include md {
    left: $spacing-lg;
    right: $spacing-lg;
  }
}

.toast {
  @include card;
  padding: $spacing-lg;
  border-radius: $border-radius-lg;
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  min-width: 300px;
  animation: slideInRight $transition-base;
  pointer-events: auto;

  @include md {
    min-width: 100%;
  }

  .toast-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  .toast-content {
    flex: 1;

    .toast-title {
      font-weight: $font-weight-semibold;
      margin-bottom: $spacing-xs;
    }

    .toast-message {
      font-size: $font-size-sm;
    }
  }

  .toast-close {
    @include button-reset;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    font-size: 20px;
    cursor: pointer;
    @include transition;

    &:hover {
      opacity: 0.7;
    }
  }

  // Toast variants
  &.toast-success {
    background: lighten($success-green, 30%);
    border-left: 4px solid $success-green;
    color: darken($success-green, 10%);

    .toast-icon {
      color: $success-green;
    }
  }

  &.toast-error {
    background: lighten($danger-red, 30%);
    border-left: 4px solid $danger-red;
    color: $danger-red;

    .toast-icon {
      color: $danger-red;
    }
  }

  &.toast-warning {
    background: $warning-bg;
    border-left: 4px solid $warning-yellow;
    color: darken($warning-yellow, 20%);

    .toast-icon {
      color: $warning-yellow;
    }
  }

  &.toast-info {
    background: lighten($info-blue, 30%);
    border-left: 4px solid $info-blue;
    color: darken($info-blue, 10%);

    .toast-icon {
      color: $info-blue;
    }
  }
}
```

---

## 📝 FILE: Update Shared Module

**Path:** `src/app/shared/shared.module.ts`

Update the module to export dialog components:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

// Components
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

// Services
import { ToastService } from './services/toast.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
    ToastContainerComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NavbarComponent,
    FooterComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent,
    ErrorDialogComponent,
    ToastContainerComponent,
  ],
  providers: [ToastService],
})
export class SharedModule {}
```

---

## ✅ Verification Checklist

- [ ] confirmation-dialog component created
- [ ] error-dialog component created
- [ ] toast.service created with success, error, warning, info methods
- [ ] toast-container component created
- [ ] All components standalone
- [ ] All SCSS files created
- [ ] SharedModule updated to export dialog components
- [ ] Material Dialog imported

---

## 🎯 Next Step

After this task completes:
1. Verify no compilation errors: `ng serve`
2. Proceed to **TASK_8_ROUTING_APP_SETUP.md**

---

**Status: Ready for Copilot Agent Mode ✅**

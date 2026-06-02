# TASK 7.2.1: Authentication Pages (Login & Register)

## 🎯 Objective
Build professional login and register pages with form validation, error handling, and service integration.

## 📍 Location
Create files in: `apps/frontend/src/app/features/auth/pages/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create login and register page components with:
- Reactive forms with validation
- Email/password inputs
- Password strength indicator (register only)
- Role selection (register only)
- Error/success messages
- Loading states
- Full HTML, TypeScript, and SCSS for both pages."
```

---

## 📝 FILE 1: login.component.ts

**Path:** `src/app/features/auth/pages/login/login.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  showPassword = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // FORM SETUP
  // ========================================

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  // ========================================
  // GETTERS
  // ========================================

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  // ========================================
  // FORM HANDLING
  // ========================================

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService
      .login({ email, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success('Login successful!', 'Welcome');
          
          // Route based on role
          if (this.authService.isCustomer()) {
            this.router.navigate(['/customer']);
          } else if (this.authService.isBarber()) {
            this.router.navigate(['/barber']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Invalid email or password';
          this.toastService.error(this.errorMessage, 'Login Failed');
        },
      });
  }

  // ========================================
  // HELPERS
  // ========================================

  getEmailError(): string {
    const control = this.email;
    if (control?.hasError('required')) {
      return 'Email is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getPasswordError(): string {
    const control = this.password;
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
```

**Path:** `src/app/features/auth/pages/login/login.component.html`

```html
<div class="auth-container">
  <div class="auth-card">
    <!-- Header -->
    <div class="auth-header">
      <h1>Welcome Back</h1>
      <p>Sign in to your QueueCut account</p>
    </div>

    <!-- Form -->
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="form-alert alert-danger">
        <span>⚠️</span>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="form-label">Email Address</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          placeholder="you@example.com"
          class="form-input"
          [class.form-error]="email?.invalid && email?.touched"
        />
        <span *ngIf="email?.invalid && email?.touched" class="form-error-text">
          {{ getEmailError() }}
        </span>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <div class="password-header">
          <label for="password" class="form-label">Password</label>
          <a href="#" class="forgot-password">Forgot password?</a>
        </div>
        <div class="password-input-wrapper">
          <input
            id="password"
            [type]="showPassword ? 'text' : 'password'"
            formControlName="password"
            placeholder="••••••••"
            class="form-input"
            [class.form-error]="password?.invalid && password?.touched"
          />
          <button
            type="button"
            class="password-toggle"
            (click)="togglePasswordVisibility()"
            [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
          >
            {{ showPassword ? '👁️‍🗨️' : '👁️' }}
          </button>
        </div>
        <span *ngIf="password?.invalid && password?.touched" class="form-error-text">
          {{ getPasswordError() }}
        </span>
      </div>

      <!-- Remember Me -->
      <div class="form-checkbox">
        <input
          id="rememberMe"
          type="checkbox"
          formControlName="rememberMe"
        />
        <label for="rememberMe">Remember me</label>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary btn-full"
        [disabled]="loading || loginForm.invalid"
      >
        <span *ngIf="!loading">Sign In</span>
        <span *ngIf="loading" class="loading-spinner">⌛</span>
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      <p>Don't have an account?
        <a routerLink="/auth/register" class="link">Sign up here</a>
      </p>
    </div>
  </div>

  <!-- Background Decoration -->
  <div class="auth-decoration"></div>
</div>
```

**Path:** `src/app/features/auth/pages/login/login.component.scss`

```scss
@import '../../../../styles/variables';
@import '../../../../styles/mixins';

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  padding: $spacing-lg;
  position: relative;
  overflow: hidden;

  .auth-decoration {
    position: absolute;
    width: 500px;
    height: 500px;
    background: $primary-gradient;
    border-radius: 50%;
    opacity: 0.1;
    top: -200px;
    right: -200px;
    z-index: 0;
  }
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: $bg-primary;
  border-radius: $border-radius-xl;
  padding: $spacing-3xl;
  box-shadow: $shadow-lg;
  position: relative;
  z-index: 1;
  animation: slideInUp $transition-base ease-out;

  @include md {
    padding: $spacing-2xl;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: $spacing-2xl;

  h1 {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-md;
    background: $primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: $color-text-secondary;
    margin: 0;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  .form-alert {
    padding: $spacing-md;
    border-radius: $border-radius-md;
    display: flex;
    gap: $spacing-md;
    align-items: flex-start;

    &.alert-danger {
      background: lighten($danger-red, 35%);
      color: $danger-red;
      border-left: 4px solid $danger-red;

      span {
        font-size: 20px;
      }

      p {
        margin: 0;
      }
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .form-label {
    font-weight: $font-weight-semibold;
    color: $color-text;
    font-size: $font-size-sm;
  }

  .form-input {
    @include input-base;
  }

  .password-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .forgot-password {
      font-size: $font-size-sm;
      color: $primary-purple;
      text-decoration: none;
      @include transition;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .password-input-wrapper {
    position: relative;

    .password-toggle {
      @include button-reset;
      position: absolute;
      right: $spacing-lg;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      cursor: pointer;
      @include transition;

      &:hover {
        opacity: 0.7;
      }
    }

    .form-input {
      padding-right: $spacing-3xl;
    }
  }

  .form-error-text {
    color: $danger-red;
    font-size: $font-size-xs;
  }

  .form-checkbox {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    font-size: $font-size-sm;

    input[type='checkbox'] {
      accent-color: $primary-purple;
    }

    label {
      margin: 0;
      cursor: pointer;
    }
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }
}

.auth-footer {
  text-align: center;
  padding-top: $spacing-lg;
  border-top: 1px solid $color-border;

  p {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: 0;

    .link {
      color: $primary-purple;
      text-decoration: none;
      font-weight: $font-weight-semibold;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 📝 FILE 2: register.component.ts

**Path:** `src/app/features/auth/pages/register/register.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.initForm();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========================================
  // FORM SETUP
  // ========================================

  private initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['CUSTOMER', Validators.required],
      terms: [false, Validators.requiredTrue],
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  // ========================================
  // VALIDATORS
  // ========================================

  private passwordMatchValidator() {
    return (formGroup: AbstractControl) => {
      const password = formGroup.get('password');
      const confirmPassword = formGroup.get('confirmPassword');

      if (password && confirmPassword) {
        if (password.value !== confirmPassword.value) {
          confirmPassword.setErrors({ passwordMismatch: true });
          return { passwordMismatch: true };
        } else {
          const errors = confirmPassword.errors;
          if (errors) {
            delete errors['passwordMismatch'];
            confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      }

      return null;
    };
  }

  // ========================================
  // GETTERS
  // ========================================

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get phone() {
    return this.registerForm.get('phone');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get terms() {
    return this.registerForm.get('terms');
  }

  // ========================================
  // PASSWORD STRENGTH
  // ========================================

  getPasswordStrength(): string {
    const pwd = this.password?.value || '';
    if (pwd.length === 0) return '';
    if (pwd.length < 6) return 'weak';
    if (pwd.length < 10) return 'medium';
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 'strong';
    return 'medium';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return '#eb5757';
    if (strength === 'medium') return '#ffc107';
    return '#28a745';
  }

  // ========================================
  // FORM HANDLING
  // ========================================

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { firstName, lastName, email, phone, password, role } = this.registerForm.value;

    this.authService
      .register({ firstName, lastName, email, phone, password, role })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.toastService.success('Account created successfully!', 'Welcome');
          this.router.navigate(['/customer']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
          this.toastService.error(this.errorMessage, 'Registration Failed');
        },
      });
  }

  // ========================================
  // ERROR HELPERS
  // ========================================

  getFirstNameError(): string {
    if (this.firstName?.hasError('required')) return 'First name is required';
    if (this.firstName?.hasError('minlength')) return 'First name must be at least 2 characters';
    return '';
  }

  getLastNameError(): string {
    if (this.lastName?.hasError('required')) return 'Last name is required';
    if (this.lastName?.hasError('minlength')) return 'Last name must be at least 2 characters';
    return '';
  }

  getEmailError(): string {
    if (this.email?.hasError('required')) return 'Email is required';
    if (this.email?.hasError('email')) return 'Please enter a valid email';
    return '';
  }

  getPasswordError(): string {
    if (this.password?.hasError('required')) return 'Password is required';
    if (this.password?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  getConfirmPasswordError(): string {
    if (this.confirmPassword?.hasError('required')) return 'Please confirm your password';
    if (this.registerForm.hasError('passwordMismatch')) return 'Passwords do not match';
    return '';
  }
}
```

**Path:** `src/app/features/auth/pages/register/register.component.html`

```html
<div class="auth-container">
  <div class="auth-card">
    <!-- Header -->
    <div class="auth-header">
      <h1>Create Account</h1>
      <p>Join QueueCut as a customer</p>
    </div>

    <!-- Form -->
    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
      <!-- Error Message -->
      <div *ngIf="errorMessage" class="form-alert alert-danger">
        <span>⚠️</span>
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Name Fields -->
      <div class="form-row-2">
        <div class="form-group">
          <label for="firstName" class="form-label">First Name</label>
          <input
            id="firstName"
            type="text"
            formControlName="firstName"
            placeholder="John"
            class="form-input"
            [class.form-error]="firstName?.invalid && firstName?.touched"
          />
          <span *ngIf="firstName?.invalid && firstName?.touched" class="form-error-text">
            {{ getFirstNameError() }}
          </span>
        </div>

        <div class="form-group">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            id="lastName"
            type="text"
            formControlName="lastName"
            placeholder="Doe"
            class="form-input"
            [class.form-error]="lastName?.invalid && lastName?.touched"
          />
          <span *ngIf="lastName?.invalid && lastName?.touched" class="form-error-text">
            {{ getLastNameError() }}
          </span>
        </div>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="form-label">Email Address</label>
        <input
          id="email"
          type="email"
          formControlName="email"
          placeholder="you@example.com"
          class="form-input"
          [class.form-error]="email?.invalid && email?.touched"
        />
        <span *ngIf="email?.invalid && email?.touched" class="form-error-text">
          {{ getEmailError() }}
        </span>
      </div>

      <!-- Phone Field -->
      <div class="form-group">
        <label for="phone" class="form-label">Phone Number (Optional)</label>
        <input
          id="phone"
          type="tel"
          formControlName="phone"
          placeholder="(555) 123-4567"
          class="form-input"
        />
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            [type]="showPassword ? 'text' : 'password'"
            formControlName="password"
            placeholder="••••••••"
            class="form-input"
            [class.form-error]="password?.invalid && password?.touched"
          />
          <button
            type="button"
            class="password-toggle"
            (click)="togglePasswordVisibility()"
          >
            {{ showPassword ? '👁️‍🗨️' : '👁️' }}
          </button>
        </div>

        <!-- Password Strength -->
        <div *ngIf="password?.value" class="password-strength">
          <div class="strength-bar">
            <div
              class="strength-fill"
              [style.width.%]="getPasswordStrength() === 'weak' ? 33 : getPasswordStrength() === 'medium' ? 66 : 100"
              [style.background-color]="getPasswordStrengthColor()"
            ></div>
          </div>
          <span class="strength-text" [style.color]="getPasswordStrengthColor()">
            {{ getPasswordStrength() }}
          </span>
        </div>

        <span *ngIf="password?.invalid && password?.touched" class="form-error-text">
          {{ getPasswordError() }}
        </span>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <div class="password-input-wrapper">
          <input
            id="confirmPassword"
            [type]="showConfirmPassword ? 'text' : 'password'"
            formControlName="confirmPassword"
            placeholder="••••••••"
            class="form-input"
            [class.form-error]="confirmPassword?.invalid && confirmPassword?.touched"
          />
          <button
            type="button"
            class="password-toggle"
            (click)="toggleConfirmPasswordVisibility()"
          >
            {{ showConfirmPassword ? '👁️‍🗨️' : '👁️' }}
          </button>
        </div>
        <span *ngIf="confirmPassword?.invalid && confirmPassword?.touched" class="form-error-text">
          {{ getConfirmPasswordError() }}
        </span>
      </div>

      <!-- Terms Checkbox -->
      <div class="form-checkbox">
        <input
          id="terms"
          type="checkbox"
          formControlName="terms"
        />
        <label for="terms">
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </label>
      </div>
      <span *ngIf="terms?.invalid && terms?.touched" class="form-error-text">
        You must agree to the terms to continue
      </span>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary btn-full"
        [disabled]="loading || registerForm.invalid"
      >
        <span *ngIf="!loading">Create Account</span>
        <span *ngIf="loading" class="loading-spinner">⌛</span>
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      <p>Already have an account?
        <a routerLink="/auth/login" class="link">Sign in here</a>
      </p>
    </div>
  </div>

  <!-- Background Decoration -->
  <div class="auth-decoration"></div>
</div>
```

**Path:** `src/app/features/auth/pages/register/register.component.scss`

```scss
@import '../../../../styles/variables';
@import '../../../../styles/mixins';

.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-secondary;
  padding: $spacing-lg;
  position: relative;
  overflow: hidden;

  .auth-decoration {
    position: absolute;
    width: 500px;
    height: 500px;
    background: $primary-gradient;
    border-radius: 50%;
    opacity: 0.1;
    top: -200px;
    right: -200px;
    z-index: 0;
  }
}

.auth-card {
  width: 100%;
  max-width: 500px;
  background: $bg-primary;
  border-radius: $border-radius-xl;
  padding: $spacing-3xl;
  box-shadow: $shadow-lg;
  position: relative;
  z-index: 1;
  animation: slideInUp $transition-base ease-out;
  max-height: 90vh;
  overflow-y: auto;

  @include md {
    padding: $spacing-2xl;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: $spacing-2xl;

  h1 {
    font-size: $font-size-3xl;
    font-weight: $font-weight-bold;
    margin-bottom: $spacing-md;
    background: $primary-gradient;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    color: $color-text-secondary;
    margin: 0;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;

  .form-alert {
    padding: $spacing-md;
    border-radius: $border-radius-md;
    display: flex;
    gap: $spacing-md;
    align-items: flex-start;

    &.alert-danger {
      background: lighten($danger-red, 35%);
      color: $danger-red;
      border-left: 4px solid $danger-red;

      span {
        font-size: 20px;
      }

      p {
        margin: 0;
      }
    }
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $spacing-md;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  .form-label {
    font-weight: $font-weight-semibold;
    color: $color-text;
    font-size: $font-size-sm;
  }

  .form-input {
    @include input-base;
  }

  .password-input-wrapper {
    position: relative;

    .password-toggle {
      @include button-reset;
      position: absolute;
      right: $spacing-lg;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      cursor: pointer;
      @include transition;

      &:hover {
        opacity: 0.7;
      }
    }

    .form-input {
      padding-right: $spacing-3xl;
    }
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    font-size: $font-size-xs;

    .strength-bar {
      flex: 1;
      height: 6px;
      background: $color-border;
      border-radius: 3px;
      overflow: hidden;

      .strength-fill {
        height: 100%;
        @include transition(width, $transition-base);
      }
    }

    .strength-text {
      text-transform: capitalize;
      font-weight: $font-weight-semibold;
      min-width: 50px;
    }
  }

  .form-error-text {
    color: $danger-red;
    font-size: $font-size-xs;
  }

  .form-checkbox {
    display: flex;
    align-items: flex-start;
    gap: $spacing-md;
    font-size: $font-size-sm;

    input[type='checkbox'] {
      accent-color: $primary-purple;
      margin-top: 4px;
    }

    label {
      margin: 0;
      cursor: pointer;
      line-height: 1.4;

      a {
        color: $primary-purple;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
  }
}

.auth-footer {
  text-align: center;
  padding-top: $spacing-lg;
  border-top: 1px solid $color-border;

  p {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin: 0;

    .link {
      color: $primary-purple;
      text-decoration: none;
      font-weight: $font-weight-semibold;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## ✅ Verification Checklist

After Copilot completes this task:

- [ ] login.component.ts created with form validation
- [ ] login.component.html created with proper layout
- [ ] login.component.scss created with styling
- [ ] register.component.ts created with role selection
- [ ] register.component.html created with all fields
- [ ] register.component.scss created with styling
- [ ] Both components are standalone
- [ ] Form validation works real-time
- [ ] Error messages display correctly
- [ ] Password visibility toggles work
- [ ] No compilation errors

---

## 🧪 Testing

Run: `ng serve` and navigate to:
- `http://localhost:4200/auth/login`
- `http://localhost:4200/auth/register`

Test:
- ✓ Invalid email error
- ✓ Short password error
- ✓ Password mismatch (register)
- ✓ Required field errors
- ✓ Submit with valid form
- ✓ Button disabled when invalid
- ✓ Loading state on submit

---

## 🚀 Next Step

After this task completes:
1. Verify: `ng serve` - no errors
2. Test both pages in browser
3. Proceed to **TASK_7_2_2_SALON_LIST.md**

---

**Status: Ready for Copilot Agent Mode ✅**

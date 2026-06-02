import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ToastService } from '@shared/services/toast.service';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

type RegisterRole = 'CUSTOMER' | 'BARBER';

interface RoleOption {
  label: string;
  value: RegisterRole;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;
  emailChecking = false;
  emailAvailable: boolean | null = null;
  emailAvailabilityMessage = '';
  readonly roleOptions: RoleOption[] = [
    { label: 'Customer', value: 'CUSTOMER' },
    { label: 'Barber', value: 'BARBER' },
  ];
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

  ngOnInit(): void {
    this.setupEmailAvailabilityCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.minLength(10)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['CUSTOMER' as RegisterRole, Validators.required],
      terms: [false, Validators.requiredTrue],
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  private setupEmailAvailabilityCheck(): void {
    this.email?.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value: string) => {
        this.checkEmailAvailability(value);
      });
  }

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

  get role() {
    return this.registerForm.get('role');
  }

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

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private checkEmailAvailability(email: string): void {
    const control = this.email;

    if (!control || control.invalid || !email) {
      this.emailChecking = false;
      this.emailAvailable = null;
      this.emailAvailabilityMessage = '';
      this.clearEmailTakenError();
      return;
    }

    this.emailChecking = true;
    this.emailAvailable = null;
    this.emailAvailabilityMessage = 'Checking email availability...';

    this.authService
      .checkEmailAvailability(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.emailChecking = false;
          this.emailAvailable = response.available;

          if (response.available) {
            this.emailAvailabilityMessage = 'Email is available';
            this.clearEmailTakenError();
          } else {
            this.emailAvailabilityMessage = 'This email is already registered';
            this.setEmailTakenError();
          }
        },
        error: () => {
          this.emailChecking = false;
          this.emailAvailable = null;
          this.emailAvailabilityMessage = 'Unable to verify email availability right now';
        },
      });
  }

  private setEmailTakenError(): void {
    const control = this.email;
    if (!control) return;

    const errors = { ...(control.errors ?? {}) };
    errors['emailTaken'] = true;
    control.setErrors(errors);
  }

  private clearEmailTakenError(): void {
    const control = this.email;
    if (!control?.errors) return;

    const { emailTaken, ...rest } = control.errors;
    control.setErrors(Object.keys(rest).length > 0 ? rest : null);
  }

  onSubmit(): void {
    if (this.registerForm.invalid || this.emailAvailable === false || this.emailChecking) {
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
        next: () => {
          this.loading = false;
          this.toastService.success('Account created successfully!', 'Welcome');
          this.router.navigate(['/customer']);
        },
        error: (err: any) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
          this.toastService.error(this.errorMessage, 'Registration Failed');
        },
      });
  }

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
    if (this.email?.hasError('emailTaken')) return 'This email is already registered';
    return '';
  }

  getEmailAvailabilityMessage(): string {
    return this.emailAvailabilityMessage;
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

  isFormDisabled(): boolean {
    return this.loading || this.registerForm.invalid || this.emailChecking || this.emailAvailable === false;
  }
}

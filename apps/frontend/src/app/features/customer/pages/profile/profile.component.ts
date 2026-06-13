import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { BookingService } from '@core/services/booking.service';
import { ToastService } from '@shared/services/toast.service';
import { User, Booking } from '@core/models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  loading = false;
  saving = false;
  totalBookings = 0;
  activeBookings = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private bookingService: BookingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Subscribe to current user updates
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.initForm(user);
      }
      this.cdr.markForCheck();
    });

    // Load statistics from bookings
    this.bookingService.getMyBookings().pipe(takeUntil(this.destroy$)).subscribe({
      next: (bookings: Booking[]) => {
        this.totalBookings = bookings.length;
        this.activeBookings = bookings.filter(
          (b) => b.status === 'PENDING' || b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS'
        ).length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading bookings statistics:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(user: User): void {
    this.profileForm = this.fb.group({
      firstName: [user.firstName, [Validators.required]],
      lastName: [user.lastName, [Validators.required]],
      phone: [user.phone || ''],
      password: ['', [Validators.minLength(6)]],
    });
  }

  get firstName() {
    return this.profileForm.get('firstName');
  }

  get lastName() {
    return this.profileForm.get('lastName');
  }

  get password() {
    return this.profileForm.get('password');
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.saving || !this.currentUser) {
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    const formValue = this.profileForm.value;
    const payload: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
    };

    if (formValue.password) {
      payload.password = formValue.password;
    }

    this.authService.updateProfile(payload).subscribe({
      next: () => {
        this.saving = false;
        this.toastService.success('Profile updated successfully.', 'Profile Saved');
        // Clear password input
        this.profileForm.patchValue({ password: '' });
        this.profileForm.markAsPristine();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.saving = false;
        const errMsg = err?.error?.message || 'Failed to update profile. Please try again.';
        this.toastService.error(errMsg, 'Update Failed');
        this.cdr.markForCheck();
      }
    });
  }

  getUserInitials(): string {
    if (!this.currentUser) return '';
    const first = this.currentUser.firstName?.charAt(0) || '';
    const last = this.currentUser.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getMemberSince(): string {
    if (!this.currentUser || !this.currentUser.createdAt) return '';
    const date = new Date(this.currentUser.createdAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

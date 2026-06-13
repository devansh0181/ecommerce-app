import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Booking, Salon } from '../../../../core/models';
import { AuthService } from '../../../../core/services/auth.service';
import { BookingService } from '../../../../core/services/booking.service';
import { SalonService } from '../../../../core/services/salon.service';

@Component({
  selector: 'app-customer-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  userName = 'Customer';
  loading = false;
  upcomingBooking: Booking | null = null;
  upcomingCount = 0;
  completedCount = 0;
  salons: Salon[] = [];

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private salonService: SalonService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Customer';
    }
    this.loadDashboardData();
  }

  get upcomingBookingServiceNames(): string {
    if (!this.upcomingBooking?.bookingServices?.length) {
      return 'No services listed';
    }
    return this.upcomingBooking.bookingServices
      .map((item: any) => item.service?.name)
      .filter(Boolean)
      .join(', ');
  }

  bookSalon(salon: Salon): void {
    this.salonService.setSelectedSalon(salon);
    this.router.navigate(['/customer/salons', salon.id]);
  }

  private loadDashboardData(): void {
    this.loading = true;
    this.cdr.markForCheck();

    // Fetch Bookings
    this.bookingService.getMyBookings().subscribe({
      next: (bookings: Booking[]) => {
        const list = bookings || [];
        
        // Completed visits count
        this.completedCount = list.filter((b) => b.status === 'COMPLETED').length;

        // Upcoming bookings
        const upcoming = list.filter((b) =>
          ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)
        );
        this.upcomingCount = upcoming.length;

        if (upcoming.length > 0) {
          // Sort chronologically (earliest first)
          upcoming.sort((a, b) => {
            const timeA = new Date(a.preferredTime || a.createdAt).getTime();
            const timeB = new Date(b.preferredTime || b.createdAt).getTime();
            return timeA - timeB;
          });
          this.upcomingBooking = upcoming[0];
        } else {
          this.upcomingBooking = null;
        }

        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('HomeComponent: Failed to load user bookings:', err);
        this.checkLoadingComplete();
      }
    });

    // Fetch Recommended Salons
    this.salonService.getSalons({ limit: 3 }).subscribe({
      next: (res: any) => {
        // Handle nested responses
        if (res && Array.isArray(res)) {
          this.salons = res.slice(0, 3);
        } else if (res && res.data && Array.isArray(res.data)) {
          this.salons = res.data.slice(0, 3);
        } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
          this.salons = res.data.data.slice(0, 3);
        } else {
          this.salons = [];
        }
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('HomeComponent: Failed to load salons:', err);
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Both endpoints completed or resolved
    this.loading = false;
    this.cdr.markForCheck();
  }
}

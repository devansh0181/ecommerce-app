import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Booking, Salon } from '../../../../core/models';
import { BookingService } from '../../../../core/services/booking.service';
import { SalonService } from '../../../../core/services/salon.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { MetricsCardComponent } from '../../components/metrics-card/metrics-card.component';
import { ScheduleTimelineComponent } from '../../components/schedule-timeline/schedule-timeline.component';
import { ActivityFeedComponent } from '../../components/activity-feed/activity-feed.component';

@Component({
  selector: 'app-barber-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MetricsCardComponent, ScheduleTimelineComponent, ActivityFeedComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = false;
  salon: Salon | null = null;
  salonId: string | null = null;
  bookings: Booking[] = [];
  queueLength = 0;
  completedToday = 0;
  todaysBookings = 0;
  averageRating: number | null = null;
  unconfiguredSalons: Salon[] = [];
  scheduleItems: Array<{ time: string; customer: string; service: string }> = [];
  activities: Array<{ type: string; message: string; time: string }> = [];

  actionItems = [
    { label: 'View all requests', route: '/barber/bookings', icon: '📩', description: 'Review recent booking requests' },
    { label: 'View queue', route: '/barber/queue', icon: '🧾', description: 'Monitor customers waiting now' },
    { label: 'View analytics', route: '/barber/analytics', icon: '📊', description: 'Analyze revenue and trends' },
    { label: 'Add new service', route: '/barber/services', icon: '✂️', description: 'Update salon offerings quickly' },
    { label: 'Edit profile', route: '/barber/profile', icon: '⚙️', description: 'Adjust salon details and hours' },
  ];

  private refreshSub?: Subscription;

  constructor(
    private bookingService: BookingService,
    private salonService: SalonService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.refreshSub = interval(60000).subscribe(() => this.loadInitialData());
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  loadInitialData(): void {
    this.loading = true;
    this.salonService.getMySalons().subscribe(
      (salons) => {
        const list = salons || [];
        this.unconfiguredSalons = list.filter(
          (s) => !s.services?.length || !s.workingHours?.length
        );

        const first = list.length ? list[0] : null;
        if (first) {
          this.salon = first;
          this.salonId = first.id;
          this.averageRating = first.rating ?? null;
          this.loadSalonData(first.id);
        } else {
          this.loading = false;
          this.cdr.markForCheck();
        }
      },
      () => {
        this.loading = false;
        this.toast.error('Unable to load salon dashboard. Please try again.');
        this.cdr.markForCheck();
      }
    );
  }



  private loadSalonData(salonId: string): void {
    this.bookingService.getSalonBookings(salonId).subscribe(
      (bookings) => {
        this.bookings = bookings || [];
        const today = new Date().toDateString();
        this.todaysBookings = this.bookings.filter((b) => new Date(b.createdAt).toDateString() === today).length;
        this.completedToday = this.bookings.filter(
          (b) => b.status === 'COMPLETED' && new Date(b.completedAt || 0).toDateString() === today
        ).length;
        this.queueLength = this.bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length;

        this.scheduleItems = this.bookings.map((b) => ({
          time: new Date(b.preferredTime || b.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          customer:
            (b.customer && `${b.customer.firstName || ''} ${b.customer.lastName || ''}`.trim()) || 'Customer',
          service: b.bookingServices?.[0]?.service?.name || 'Service',
        }));

        this.activities = this.bookings.slice(0, 8).map((b) => ({
          type: b.status,
          message:
            `${(b.customer && `${b.customer.firstName || ''} ${b.customer.lastName || ''}`.trim()) || 'Customer'} — ` +
            `${b.bookingServices?.map((s) => s.service?.name).filter(Boolean).join(', ') || 'Service'}`,
          time: new Date(b.createdAt).toLocaleString(),
        }));

        this.loading = false;
        this.cdr.markForCheck();
      },
      () => {
        this.loading = false;
        this.toast.error('Unable to fetch booking activity.');
        this.cdr.markForCheck();
      }
    );
  }
}

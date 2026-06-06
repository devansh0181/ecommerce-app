import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { Booking } from '../../../../../core/models';
import { BookingService } from '../../../../../core/services/booking.service';
import { SalonService } from '../../../../../core/services/salon.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { QueueItemComponent } from './queue-item.component';
import { QueueSummaryComponent } from './queue-summary.component';

@Component({
  selector: 'app-queue-view',
  standalone: true,
  imports: [CommonModule, QueueItemComponent, QueueSummaryComponent],
  templateUrl: './queue-view.component.html',
  styleUrls: ['./queue-view.component.scss'],
})
export class QueueViewComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  upcomingQueue: Booking[] = [];
  currentService: Booking | null = null;
  loading = false;
  error: string | null = null;
  autoRefresh = true;
  actionPendingId: string | null = null;
  private refreshSub?: Subscription;
  private salonId: string | null = null;
  private readonly refreshIntervalMs = 15000;

  constructor(
    private bookingService: BookingService,
    private salonService: SalonService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadQueue();
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    if (this.autoRefresh) {
      this.startAutoRefresh();
      this.toast.success('Auto-refresh enabled');
    } else {
      this.refreshSub?.unsubscribe();
      this.toast.info('Auto-refresh paused');
    }
  }

  refresh(): void {
    this.loadQueue();
  }

  get queueEstimatedMinutes(): number {
    return this.bookings.reduce((sum, booking) => sum + (booking.totalDurationMinutes || 0), 0);
  }

  get averageDurationMinutes(): number {
    if (!this.bookings.length) {
      return 0;
    }
    return Math.round(this.queueEstimatedMinutes / this.bookings.length);
  }

  get currentServiceServiceNames(): string {
    return (this.currentService?.bookingServices || [])
      .map((item: { service?: { name?: string } }) => item.service?.name)
      .filter(Boolean)
      .join(', ') || 'No services listed';
  }

  handleStartService(booking: Booking): void {
    this.actionPendingId = booking.id;
    this.bookingService.startBooking(booking.id).subscribe(
      () => {
        this.toast.success('Service started for customer.');
        this.actionPendingId = null;
        this.loadQueue();
      },
      () => {
        this.toast.error('Unable to start service. Please try again.');
        this.actionPendingId = null;
      }
    );
  }

  handleCompleteService(booking: Booking): void {
    this.actionPendingId = booking.id;
    this.bookingService.completeBooking(booking.id).subscribe(
      () => {
        this.toast.success('Service completed successfully.');
        this.actionPendingId = null;
        this.loadQueue();
      },
      () => {
        this.toast.error('Unable to complete service. Please try again.');
        this.actionPendingId = null;
      }
    );
  }

  handleReschedule(booking: Booking): void {
    this.toast.info('Reschedule workflow is coming soon.');
  }

  handleCancel(booking: Booking): void {
    this.actionPendingId = booking.id;
    this.bookingService.rejectBooking(booking.id, 'Cancelled by barber').subscribe(
      () => {
        this.toast.success('Booking cancelled successfully.');
        this.actionPendingId = null;
        this.loadQueue();
      },
      () => {
        this.toast.error('Unable to cancel booking. Please try again.');
        this.actionPendingId = null;
      }
    );
  }

  private startAutoRefresh(): void {
    this.refreshSub?.unsubscribe();
    this.refreshSub = interval(this.refreshIntervalMs).subscribe(() => {
      if (this.autoRefresh) {
        this.loadQueue(true);
      }
    });
  }

  private loadQueue(force = false): void {
    if (!force && this.loading) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.salonService.getMySalons().subscribe(
      (salons) => {
        const salon = salons?.[0] ?? null;
        if (!salon) {
          this.error = 'No salon was found for this barber account.';
          this.loading = false;
          return;
        }

        this.salonId = salon.id;
        this.bookingService.getSalonQueue(salon.id).subscribe(
          (bookings) => {
            this.bookings = bookings || [];
            this.currentService = this.bookings.find((booking) => booking.status === 'IN_PROGRESS') || null;
            this.upcomingQueue = this.bookings.filter((booking) => booking.status !== 'IN_PROGRESS');
            this.loading = false;
          },
          () => {
            this.error = 'Failed to load queue. Please try again.';
            this.loading = false;
          }
        );
      },
      () => {
        this.error = 'Unable to resolve salon settings. Please check your connection.';
        this.loading = false;
      }
    );
  }
}

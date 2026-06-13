import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
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
  imports: [CommonModule, QueueItemComponent, QueueSummaryComponent, RouterModule],
  templateUrl: './queue-view.component.html',
  styleUrls: ['./queue-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueViewComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  upcomingQueue: Booking[] = [];
  currentService: Booking | null = null;
  loading = false;
  error: string | null = null;
  autoRefresh = true;
  actionPendingId: string | null = null;
  salonId: string | null = null;
  private refreshSub?: Subscription;
  private readonly refreshIntervalMs = 15000;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private salonService: SalonService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.salonId = params.get('salonId');
      this.loadQueue();
    });
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
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();
    this.bookingService.startBooking(booking.id).subscribe({
      next: () => {
        this.toast.success('Service started for customer.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
        this.loadQueue();
      },
      error: () => {
        this.toast.error('Unable to start service. Please try again.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  handleCompleteService(booking: Booking): void {
    this.actionPendingId = booking.id;
    this.cdr.markForCheck();
    this.bookingService.completeBooking(booking.id).subscribe({
      next: () => {
        this.toast.success('Service completed successfully.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
        this.loadQueue();
      },
      error: () => {
        this.toast.error('Unable to complete service. Please try again.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  handleReschedule(booking: Booking): void {
    this.toast.info('Reschedule workflow is coming soon.');
  }

  handleCancel(booking: Booking): void {
    this.actionPendingId = booking.id;
    this.cdr.markForCheck();
    this.bookingService.rejectBooking(booking.id, 'Cancelled by barber').subscribe({
      next: () => {
        this.toast.success('Booking cancelled successfully.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
        this.loadQueue();
      },
      error: () => {
        this.toast.error('Unable to cancel booking. Please try again.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
      }
    });
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

    if (!this.salonId) {
      this.error = 'No salon location resolved from route params.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.bookingService.getSalonQueue(this.salonId).subscribe({
      next: (bookings) => {
        this.bookings = bookings || [];
        this.currentService = this.bookings.find((booking) => booking.status === 'IN_PROGRESS') || null;
        this.upcomingQueue = this.bookings.filter((booking) => booking.status !== 'IN_PROGRESS');
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load queue. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}

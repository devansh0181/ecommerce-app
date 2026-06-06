import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Booking, BookingService as BookingServiceModel } from '../../../../../core/models';
import { BookingService } from '../../../../../core/services/booking.service';
import { FormatDurationPipe } from '../../../../../shared/pipes/format-duration.pipe';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';
import { BookingStatusIndicatorComponent } from '../../../../../shared/components/booking-status-indicator/booking-status-indicator.component';
import { StatusTimelineComponent, TimelineStep } from '../../../../../shared/components/status-timeline/status-timeline.component';
import { QueuePositionCardComponent } from '../../../components/queue-position-card/queue-position-card.component';

@Component({
  selector: 'app-customer-booking-detail',
  standalone: true,
  imports: [CommonModule, FormatPricePipe, FormatDurationPipe, BookingStatusIndicatorComponent, StatusTimelineComponent, QueuePositionCardComponent],
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss'],
})
export class BookingDetailComponent implements OnInit, OnDestroy {
  booking: Booking | null = null;
  loading = false;
  bookingError: string | null = null;

  timelineSteps: TimelineStep[] = [];

  private routeSubscription?: Subscription;
  private bookingSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const bookingId = params.get('id');
      if (bookingId) {
        this.loadBooking(bookingId);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.bookingSubscription?.unsubscribe();
  }

  goBack(): void {
    this.location.back();
  }

  loadBooking(bookingId?: string): void {
    if (!bookingId && this.booking?.id) {
      bookingId = this.booking.id;
    }
    if (!bookingId) {
      this.bookingError = 'Booking ID is missing.';
      return;
    }

    this.bookingSubscription?.unsubscribe();
    this.loading = true;
    this.bookingError = null;

    this.bookingSubscription = this.bookingService
      .getBookingById(bookingId)
      .pipe(
        catchError((err: any) => {
          console.error('Unable to load booking', err);
          this.bookingError = 'Unable to retrieve booking details at this time.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((booking) => {
        if (!booking) {
          this.booking = null;
          return;
        }

        this.booking = booking;
        this.setupTimeline();
        this.cdr.markForCheck();
      });
  }


  confirmCancel(): void {
    const confirmed = window.confirm(
      'Customer cancellation is not supported in this release. Contact your salon to cancel this booking.'
    );
    if (confirmed) {
      window.alert('Please contact the salon to request cancellation.');
    }
  }

  trackByService(index: number, service: BookingServiceModel | undefined): string {
    return service?.id || `${index}`;
  }


  private setupTimeline(): void {
    if (!this.booking) {
      this.timelineSteps = [];
      return;
    }

    const createdAt = this.booking.createdAt;
    const acceptedAt = this.booking.acceptedAt;
    const inProgressAt = this.booking.status === 'IN_PROGRESS' ? this.booking.acceptedAt : undefined;
    const completedAt = this.booking.completedAt;

    this.timelineSteps = [
      {
        label: 'Created',
        timestamp: createdAt,
        state: 'completed',
      },
      {
        label: 'Accepted',
        timestamp: acceptedAt,
        state: this.booking.status === 'PENDING' ? 'current' : acceptedAt ? 'completed' : 'pending',
      },
      {
        label: 'In Progress',
        timestamp: inProgressAt,
        state:
          this.booking.status === 'IN_PROGRESS'
            ? 'current'
            : ['COMPLETED', 'IN_PROGRESS'].includes(this.booking.status)
            ? 'completed'
            : 'pending',
      },
      {
        label: 'Completed',
        timestamp: completedAt,
        state: this.booking.status === 'COMPLETED' ? 'completed' : 'pending',
      },
    ];
  }

}


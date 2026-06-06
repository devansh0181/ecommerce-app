import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Booking } from '../../../../../core/models';
import { BookingService } from '../../../../../core/services/booking.service';
import { BookingCardComponent } from './booking-card.component';

interface BookingTab {
  label: string;
  value: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, BookingCardComponent],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss'],
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  tabs: BookingTab[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Upcoming', value: 'UPCOMING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  selectedTab = 'ALL';
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = false;
  error: string | null = null;
  skeletonItems = [1, 2, 3, 4];

  private filterSubject = new BehaviorSubject<string>('ALL');
  private bookingSubscription?: Subscription;
  private filterSubscription?: Subscription;

  constructor(
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.filterSubscription = this.filterSubject
      .pipe(debounceTime(120), distinctUntilChanged())
      .subscribe((value) => {
        this.selectedTab = value;
        this.applyFilter();
        this.cdr.markForCheck();
      });

    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.bookingSubscription?.unsubscribe();
    this.filterSubscription?.unsubscribe();
  }

  onSelectTab(value: string): void {
    if (this.selectedTab === value) {
      return;
    }
    this.filterSubject.next(value);
  }

  reloadBookings(): void {
    this.loadBookings();
  }

  openBooking(bookingId: string): void {
    this.router.navigate(['/customer/bookings', bookingId]);
  }

  trackByBooking(index: number, booking: Booking): string {
    return booking.id;
  }

  private loadBookings(): void {
    this.bookingSubscription?.unsubscribe();
    this.loading = true;
    this.error = null;

    this.bookingSubscription = this.bookingService
      .getMyBookings()
      .pipe(
        catchError((err: any) => {
          console.error('Failed to load bookings', err);
          this.error = 'Please check your connection and try again.';
          return of([] as Booking[]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((bookings: Booking[]) => {
        this.bookings = bookings || [];
        this.applyFilter();
        this.cdr.markForCheck();
      });
  }

  private applyFilter(): void {
    if (!this.bookings?.length) {
      this.filteredBookings = [];
      return;
    }

    if (this.selectedTab === 'UPCOMING') {
      this.filteredBookings = this.bookings.filter((booking) =>
        ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(booking.status)
      );
      return;
    }

    if (this.selectedTab === 'COMPLETED') {
      this.filteredBookings = this.bookings.filter((booking) => booking.status === 'COMPLETED');
      return;
    }

    if (this.selectedTab === 'CANCELLED') {
      this.filteredBookings = this.bookings.filter((booking) => booking.status === 'REJECTED');
      return;
    }

    this.filteredBookings = [...this.bookings];
  }
}


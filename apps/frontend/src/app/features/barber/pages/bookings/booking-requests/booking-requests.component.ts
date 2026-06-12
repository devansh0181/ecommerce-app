import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Booking } from '../../../../../core/models';
import { BookingService } from '../../../../../core/services/booking.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BookingRequestCardComponent } from './request-card.component';
import { AcceptDialogComponent } from './accept-dialog.component';
import { RejectDialogComponent } from './reject-dialog.component';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BookingRequestCardComponent, RouterModule],
  templateUrl: './booking-requests.component.html',
  styleUrls: ['./booking-requests.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingRequestsComponent implements OnInit {
  loading = false;
  actionPendingId: string | null = null;
  error: string | null = null;
  bookings: Booking[] = [];
  selectedStatus: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' = 'PENDING';
  salonId: string | null = null;

  statusTabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Rejected', value: 'REJECTED' },
  ] as const;

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.salonId = params.get('salonId');
      if (this.salonId) {
        this.loadRequests(this.salonId);
      } else {
        this.error = 'No salon location resolved from route params.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredBookings(): Booking[] {
    return this.bookings;
  }

  switchTab(status: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'): void {
    this.selectedStatus = status;
    if (this.salonId) {
      this.loadRequests(this.salonId);
    }
  }

  refresh(): void {
    if (this.salonId) {
      this.loadRequests(this.salonId);
    }
  }

  loadRequests(salonId?: string): void {
    if (salonId) {
      this.salonId = salonId;
    }

    if (!this.salonId) {
      this.error = 'No salon location resolved.';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    const statusParam = this.selectedStatus === 'ALL' ? undefined : this.selectedStatus;

    this.bookingService.getSalonBookings(this.salonId, statusParam ? { status: statusParam } : undefined).subscribe({
      next: (bookings) => {
        this.bookings = bookings || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Unable to load booking requests right now. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openAcceptDialog(booking: Booking): void {
    const dialogRef = this.dialog.open(AcceptDialogComponent, {
      width: '460px',
      data: { booking },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.acceptBooking(booking.id);
      }
      this.cdr.markForCheck();
    });
  }

  openRejectDialog(booking: Booking): void {
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '520px',
      data: { booking },
    });

    dialogRef.afterClosed().subscribe((reason) => {
      if (reason) {
        this.rejectBooking(booking.id, reason);
      }
      this.cdr.markForCheck();
    });
  }

  private acceptBooking(bookingId: string): void {
    this.actionPendingId = bookingId;
    this.cdr.markForCheck();

    this.bookingService.acceptBooking(bookingId).subscribe({
      next: () => {
        this.toast.success('Booking request accepted successfully.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
        if (this.salonId) {
          this.loadRequests(this.salonId);
        }
      },
      error: () => {
        this.toast.error('Could not accept this request. Please try again.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
      }
    });
  }

  private rejectBooking(bookingId: string, reason: string): void {
    this.actionPendingId = bookingId;
    this.cdr.markForCheck();

    this.bookingService.rejectBooking(bookingId, reason).subscribe({
      next: () => {
        this.toast.success('Booking request rejected. Customer has been notified.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
        if (this.salonId) {
          this.loadRequests(this.salonId);
        }
      },
      error: () => {
        this.toast.error('Failed to reject the booking request. Please try again.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
      }
    });
  }
}

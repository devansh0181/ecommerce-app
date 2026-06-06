import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Booking } from '../../../../../core/models';
import { BookingService } from '../../../../../core/services/booking.service';
import { SalonService } from '../../../../../core/services/salon.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { BookingRequestCardComponent } from './request-card.component';
import { AcceptDialogComponent } from './accept-dialog.component';
import { RejectDialogComponent } from './reject-dialog.component';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [CommonModule, MatDialogModule, BookingRequestCardComponent],
  templateUrl: './booking-requests.component.html',
  styleUrls: ['./booking-requests.component.scss'],
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
    private bookingService: BookingService,
    private salonService: SalonService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  get filteredBookings(): Booking[] {
    return this.bookings;
  }

  switchTab(status: 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'): void {
    this.selectedStatus = status;
    this.loadRequests();
  }

  refresh(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.error = null;

    this.salonService.getMySalons().subscribe(
      (salons) => {
        const salon = salons?.[0] ?? null;
        if (!salon) {
          this.error = 'No salon found for this account.';
          this.loading = false;
          return;
        }

        this.salonId = salon.id;
        const statusParam = this.selectedStatus === 'ALL' ? undefined : this.selectedStatus;

        this.bookingService.getSalonBookings(salon.id, statusParam ? { status: statusParam } : undefined).subscribe(
          (bookings) => {
            this.bookings = bookings || [];
            this.loading = false;
          },
          () => {
            this.error = 'Unable to load booking requests right now. Please try again.';
            this.loading = false;
          }
        );
      },
      () => {
        this.error = 'Unable to resolve your salon. Please check your connection and try again.';
        this.loading = false;
      }
    );
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
    });
  }

  private acceptBooking(bookingId: string): void {
    this.actionPendingId = bookingId;
    this.bookingService.acceptBooking(bookingId).subscribe(
      () => {
        this.toast.success('Booking request accepted successfully.');
        this.actionPendingId = null;
        this.loadRequests();
      },
      () => {
        this.toast.error('Could not accept this request. Please try again.');
        this.actionPendingId = null;
      }
    );
  }

  private rejectBooking(bookingId: string, reason: string): void {
    this.actionPendingId = bookingId;
    this.bookingService.rejectBooking(bookingId, reason).subscribe(
      () => {
        this.toast.success('Booking request rejected. Customer has been notified.');
        this.actionPendingId = null;
        this.loadRequests();
      },
      () => {
        this.toast.error('Failed to reject the booking request. Please try again.');
        this.actionPendingId = null;
      }
    );
  }
}

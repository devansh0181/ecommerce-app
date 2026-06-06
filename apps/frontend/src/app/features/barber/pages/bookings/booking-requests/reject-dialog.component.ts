import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Booking } from '../../../../../core/models';

export interface RejectDialogData {
  booking: Booking;
}

@Component({
  selector: 'app-reject-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reject-dialog.component.html',
  styleUrls: ['./reject-dialog.component.scss'],
})
export class RejectDialogComponent {
  booking: Booking;
  reason = '';

  constructor(
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectDialogData
  ) {
    this.booking = data.booking;
  }

  get serviceNames(): string {
    return (this.booking.bookingServices || [])
      .map((item: { service?: { name?: string } }) => item.service?.name)
      .filter(Boolean)
      .join(', ') || 'N/A';
  }

  onConfirm(): void {
    this.dialogRef.close(this.reason.trim());
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

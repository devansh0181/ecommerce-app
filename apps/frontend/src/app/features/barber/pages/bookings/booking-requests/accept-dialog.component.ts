import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Booking } from '../../../../../core/models';

export interface AcceptDialogData {
  booking: Booking;
}

@Component({
  selector: 'app-accept-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accept-dialog.component.html',
  styleUrls: ['./accept-dialog.component.scss'],
})
export class AcceptDialogComponent {
  booking: Booking;

  constructor(
    public dialogRef: MatDialogRef<AcceptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AcceptDialogData
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
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

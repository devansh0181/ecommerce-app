import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'bookingStatus', pure: true, standalone: true })
export class BookingStatusPipe implements PipeTransform {
  transform(status: string | null | undefined): string {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'ACCEPTED':
        return 'Accepted';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'REJECTED':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }
}

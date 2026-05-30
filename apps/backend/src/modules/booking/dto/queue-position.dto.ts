export class QueuePositionDto {
  bookingId: string;
  position: number;
  estimatedWaitTimeMinutes: number;
  bookingsAhead: number;
  status: string;
  message: string;
}
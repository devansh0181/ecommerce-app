import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingStatus } from '../../common/enums/booking-status.enum'
import { QueuePositionDto } from './dto/queue-position.dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  /**
   * Get current queue for a salon
   * Returns all ACCEPTED bookings ordered by acceptedAt
   */
  async getSalonQueue(salonId: string): Promise<Booking[]> {
    return await this.bookingRepository.find({
      where: {
        salonId,
        status: BookingStatus.ACCEPTED,
      },
      relations: ['customer', 'bookingServices', 'bookingServices.service'],
      order: {
        acceptedAt: 'ASC', // First accepted, first in queue
      },
    });
  }

  /**
   * Calculate queue position for a specific booking
   */
  async getQueuePosition(bookingId: string): Promise<QueuePositionDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['salon'],
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // If booking is not ACCEPTED, it's not in queue
    if (booking.status !== BookingStatus.ACCEPTED) {
      return {
        bookingId: booking.id,
        position: 0,
        estimatedWaitTimeMinutes: 0,
        bookingsAhead: 0,
        status: booking.status,
        message: this.getStatusMessage(booking.status),
      };
    }

    // Get all bookings ahead in queue
    const bookingsAhead = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.salonId = :salonId', { salonId: booking.salonId })
      .andWhere('booking.status = :status', { status: BookingStatus.ACCEPTED })
      .andWhere('booking.acceptedAt < :acceptedAt', {
        acceptedAt: booking.acceptedAt,
      })
      .orderBy('booking.acceptedAt', 'ASC')
      .getMany();

    // Calculate position (1-indexed)
    const position = bookingsAhead.length + 1;

    // Calculate total wait time (sum of durations of all bookings ahead)
    const estimatedWaitTimeMinutes = bookingsAhead.reduce(
      (total, b) => total + b.totalDurationMinutes,
      0,
    );

    return {
      bookingId: booking.id,
      position,
      estimatedWaitTimeMinutes,
      bookingsAhead: bookingsAhead.length,
      status: booking.status,
      message: `You are #${position} in queue. Estimated wait time: ${estimatedWaitTimeMinutes} minutes.`,
    };
  }

  /**
   * Get status message for booking
   */
  private getStatusMessage(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Your booking is pending approval from the salon.';
      case BookingStatus.ACCEPTED:
        return 'Your booking has been accepted. You are in the queue.';
      case BookingStatus.REJECTED:
        return 'Your booking has been rejected.';
      case BookingStatus.IN_PROGRESS:
        return 'Your service is currently in progress.';
      case BookingStatus.COMPLETED:
        return 'Your service has been completed.';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Get queue summary (total count, total wait time)
   */
  async getQueueSummary(salonId: string): Promise<{
    totalInQueue: number;
    totalWaitTimeMinutes: number;
  }> {
    const queue = await this.getSalonQueue(salonId);

    const totalInQueue = queue.length;
    const totalWaitTimeMinutes = queue.reduce(
      (total, booking) => total + booking.totalDurationMinutes,
      0,
    );

    return {
      totalInQueue,
      totalWaitTimeMinutes,
    };
  }
}
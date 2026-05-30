import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingService as BookingServiceEntity } from '../../entities/booking-service.entity';
import { Salon } from '../../entities/salon.entity';
import { ServiceService } from '../service/service.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { BookingStatus } from '../../common/enums/booking-status.enum'
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingServiceEntity)
    private bookingServiceRepository: Repository<BookingServiceEntity>,
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
    private serviceService: ServiceService,
    private notificationService: NotificationService, 
  ) {}

  /**
   * Create a new booking (Customer only)
   */
  async create(customerId: string, reqData: CreateBookingDto): Promise<Booking> {
    const { salonId, serviceIds, preferredTime } = reqData;

    // 1. Verify salon exists and is open
    const salon = await this.verifySalonOpen(salonId);

    // 2. Check for existing active booking
    await this.checkNoActiveBooking(customerId, salonId);

    // 3. Validate and get services
    const services = await this.serviceService.getActiveServicesByIds(
      salonId,
      serviceIds,
    );

    // 4. Calculate totals
    const { totalPrice, totalDurationMinutes } = this.serviceService.calculateTotals(services);

    // 5. Validate preferred time
    this.validatePreferredTime(preferredTime);

    // 6. Create booking
    const booking = this.bookingRepository.create({
      customerId,
      salonId,
      preferredTime: new Date(preferredTime),
      totalPrice,
      totalDurationMinutes,
      status: BookingStatus.PENDING,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // 7. Create booking services (snapshot prices and durations)
    const bookingServices = services.map((service) => {
      return this.bookingServiceRepository.create({
        bookingId: savedBooking.id,
        serviceId: service.id,
        priceAtBooking: service.price,
        durationAtBooking: service.durationMinutes,
      });
    });

    await this.bookingServiceRepository.save(bookingServices);

    // 8. Return booking with relations
    const completeBooking = await this.findOne(savedBooking.id);
    // Send notification to barber
    try {
      await this.notificationService.sendBookingCreatedNotification(
        completeBooking,
      );
    } catch (error) {
      // Log but don't fail - booking should be created even if email fails
      console.error('Email notification failed:', error);
    }

    return completeBooking;
  }

  /**
   * Get booking by ID
   */
  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'salon',
        'salon.user',
        'bookingServices',
        'bookingServices.service',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  /**
   * Get customer's bookings
   */
  async findByCustomer(customerId: string, status?: BookingStatus): Promise<Booking[]> {
    const where: any = { customerId };
    if (status) {
      where.status = status;
    }

    return await this.bookingRepository.find({
      where,
      relations: ['salon', 'bookingServices', 'bookingServices.service'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get salon's bookings (Barber only)
   */
  async findBySalon(
    salonId: string,
    userId: string,
    status?: BookingStatus,
  ): Promise<Booking[]> {
    // Verify ownership
    await this.verifySalonOwnership(salonId, userId);

    const where: any = { salonId };
    if (status) {
      where.status = status;
    }

    return await this.bookingRepository.find({
      where,
      relations: ['customer', 'bookingServices', 'bookingServices.service'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Accept booking (Barber only)
   */
  async acceptBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    // Verify ownership
    await this.verifySalonOwnership(booking.salonId, userId);

    // Verify status
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be accepted');
    }

    // Accept booking
    booking.status = BookingStatus.ACCEPTED;
    booking.acceptedAt = new Date();

    const updatedBooking = await this.bookingRepository.save(booking);
    // Send notification to customer
    try {
      await this.notificationService.sendBookingAcceptedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
  }

  /**
   * Reject booking (Barber only)
   */
  async rejectBooking(
    id: string,
    userId: string,
    rejectDto: RejectBookingDto,
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    // Verify ownership
    await this.verifySalonOwnership(booking.salonId, userId);

    // Verify status
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.ACCEPTED
    ) {
      throw new BadRequestException('Only pending or accepted bookings can be rejected');
    }

    // Reject booking
    booking.status = BookingStatus.REJECTED;
    booking.rejectionReason = rejectDto.rejectionReason || 'No reason provided';

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingRejectedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
  }

  /**
   * Start service (Barber only)
   */
  async startService(id: string, userId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    // Verify ownership
    await this.verifySalonOwnership(booking.salonId, userId);

    // Verify status
    if (booking.status !== BookingStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted bookings can be started');
    }

    // Start service
    booking.status = BookingStatus.IN_PROGRESS;

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingStartedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
  }

  /**
   * Complete service (Barber only)
   */
  async completeService(id: string, userId: string): Promise<Booking> {
    const booking = await this.findOne(id);

    // Verify ownership
    await this.verifySalonOwnership(booking.salonId, userId);

    // Verify status
    if (booking.status !== BookingStatus.IN_PROGRESS) {
      throw new BadRequestException('Only in-progress bookings can be completed');
    }

    // Complete service
    booking.status = BookingStatus.COMPLETED;
    booking.completedAt = new Date();

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingCompletedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
  }

  /**
   * Helper: Verify salon exists and is open
   */
  private async verifySalonOpen(salonId: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id: salonId },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (!salon.isOpen) {
      throw new BadRequestException('Salon is currently closed');
    }

    return salon;
  }

  /**
   * Helper: Check customer doesn't have active booking for this salon
   */
  private async checkNoActiveBooking(
    customerId: string,
    salonId: string,
  ): Promise<void> {
    const activeBooking = await this.bookingRepository.findOne({
      where: [
        { customerId, salonId, status: BookingStatus.PENDING },
        { customerId, salonId, status: BookingStatus.ACCEPTED },
        { customerId, salonId, status: BookingStatus.IN_PROGRESS },
      ],
    });

    if (activeBooking) {
      throw new BadRequestException(
        'You already have an active booking for this salon. Please wait for it to complete.',
      );
    }
  }

  /**
   * Helper: Validate preferred time
   */
  private validatePreferredTime(preferredTime: string): void {
    const preferredDate = new Date(preferredTime);
    const now = new Date();

    if (preferredDate <= now) {
      throw new BadRequestException('Preferred time must be in the future');
    }
  }

  /**
   * Helper: Verify salon ownership
   */
  private async verifySalonOwnership(salonId: string, userId: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id: salonId },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    if (salon.ownerId !== userId) {
      throw new ForbiddenException('You can only manage bookings for your own salon');
    }

    return salon;
  }
}
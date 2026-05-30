import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { QueueService } from './queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { BookingQueryDto } from './dto/booking-query.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';

/*
Customer Endpoints:

POST /api/bookings - Create booking request - done
GET /api/bookings/my-bookings - Get customer's bookings - done
GET /api/bookings/:id - Get booking details - done
GET /api/bookings/:id/queue-position - Get queue position & wait time

Barber Endpoints:

GET /api/salons/:salonId/bookings - Get salon's booking requests - done
PATCH /api/bookings/:id/accept - Accept booking
PATCH /api/bookings/:id/reject - Reject booking
PATCH /api/bookings/:id/start - Start service (In Progress)
PATCH /api/bookings/:id/complete - Complete service

Queue Endpoints:

GET /api/salons/:salonId/queue - Get current queue
*/
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * POST /api/bookings
   * Create a new booking (Customer only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() reqData: CreateBookingDto,
  ) {
    return this.bookingService.create(user.id, reqData);
  }

  /**
   * GET /api/bookings/my-bookings
   * Get customer's bookings
   */
  @Get('my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async getMyBookings(
    @CurrentUser() user: User,
    @Query() query: BookingQueryDto,
  ) {
    return this.bookingService.findByCustomer(user.id, query.status);
  }

  /**
   * GET /api/bookings/:id
   * Get booking details
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  /**
   * GET /api/bookings/:id/queue-position
   * Get booking's queue position and wait time
   */
  @Get(':id/queue-position')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async getQueuePosition(@Param('id') id: string) {
    return this.queueService.getQueuePosition(id);
  }

  /**
   * PATCH /api/bookings/:id/accept
   * Accept booking (Barber only)
   */
  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async accept(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.acceptBooking(id, user.id);
  }

  /**
   * PATCH /api/bookings/:id/reject
   * Reject booking (Barber only)
   */
  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() rejectDto: RejectBookingDto,
  ) {
    return this.bookingService.rejectBooking(id, user.id, rejectDto);
  }

  /**
   * PATCH /api/bookings/:id/start
   * Start service (Barber only)
   */
  @Patch(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async start(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.startService(id, user.id);
  }

  /**
   * PATCH /api/bookings/:id/complete
   * Complete service (Barber only)
   */
  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async complete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingService.completeService(id, user.id);
  }
}
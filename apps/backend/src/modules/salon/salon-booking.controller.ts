import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from '../booking/booking.service';
import { QueueService } from '../booking/queue.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { BookingQueryDto } from '../booking/dto/booking-query.dto';

@Controller('salons/:salonId')
export class SalonBookingController {
  constructor(
    private readonly bookingService: BookingService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * GET /api/salons/:salonId/bookings
   * Get salon's bookings (Barber/Owner only)
   */
  @Get('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async getSalonBookings(
    @Param('salonId') salonId: string,
    @CurrentUser() user: User,
    @Query() query: BookingQueryDto,
  ) {
    return this.bookingService.findBySalon(salonId, user.id, query.status);
  }

  /**
   * GET /api/salons/:salonId/queue
   * Get current queue for a salon (Public or authenticated)
   */
  @Get('queue')
  async getSalonQueue(@Param('salonId') salonId: string) {
    return this.queueService.getSalonQueue(salonId);
  }
}
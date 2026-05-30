# Phase 5: Booking System & Queue Management - Complete Guide

## 🎯 Goal
Build the complete booking workflow with queue management:
- Booking creation with multi-service selection
- Booking validation (salon open, services active, no duplicates)
- Booking status workflow (Pending → Accepted → Rejected → In Progress → Completed)
- Queue position calculation
- Wait time estimation
- BookingService join table with price/duration snapshots
- Barber booking management

---

## 📋 What We'll Build

### Customer Endpoints:
1. `POST /api/bookings` - Create booking request
2. `GET /api/bookings/my-bookings` - Get customer's bookings
3. `GET /api/bookings/:id` - Get booking details
4. `GET /api/bookings/:id/queue-position` - Get queue position & wait time

### Barber Endpoints:
5. `GET /api/salons/:salonId/bookings` - Get salon's booking requests
6. `PATCH /api/bookings/:id/accept` - Accept booking
7. `PATCH /api/bookings/:id/reject` - Reject booking
8. `PATCH /api/bookings/:id/start` - Start service (In Progress)
9. `PATCH /api/bookings/:id/complete` - Complete service

### Queue Endpoints:
10. `GET /api/salons/:salonId/queue` - Get current queue

---

## 🎯 Booking Workflow State Machine

```
┌─────────┐
│ PENDING │ (Customer creates booking)
└────┬────┘
     │
     ├──────────────────────┐
     │                      │
     v                      v
┌──────────┐          ┌──────────┐
│ ACCEPTED │          │ REJECTED │ (End state)
└────┬─────┘          └──────────┘
     │
     v
┌──────────────┐
│ IN_PROGRESS  │ (Barber starts service)
└──────┬───────┘
       │
       v
┌──────────┐
│COMPLETED │ (End state)
└──────────┘
```

---

## Step 1: Create Booking DTOs (25 minutes)

### 1.1 Create Booking DTO

**File: `src/modules/booking/dto/create-booking.dto.ts`**
```typescript
import { IsArray, IsNotEmpty, IsUUID, IsDateString, ArrayMinSize } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  salonId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one service must be selected' })
  @IsUUID('4', { each: true })
  serviceIds: string[];

  @IsDateString()
  @IsNotEmpty()
  preferredTime: string; // ISO 8601 format: "2024-02-15T14:00:00.000Z"
}
```

### 1.2 Reject Booking DTO

**File: `src/modules/booking/dto/reject-booking.dto.ts`**
```typescript
import { IsString, IsOptional } from 'class-validator';

export class RejectBookingDto {
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
```

### 1.3 Booking Response DTO

**File: `src/modules/booking/dto/booking-response.dto.ts`**
```typescript
import { BookingStatus } from '../../../common/enums';

export class BookingResponseDto {
  id: string;
  status: BookingStatus;
  preferredTime: Date;
  totalDurationMinutes: number;
  totalPrice: number;
  rejectionReason?: string;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  
  salon: {
    id: string;
    name: string;
    address: string;
  };
  
  services: Array<{
    id: string;
    name: string;
    priceAtBooking: number;
    durationAtBooking: number;
  }>;
}
```

### 1.4 Queue Position DTO

**File: `src/modules/booking/dto/queue-position.dto.ts`**
```typescript
export class QueuePositionDto {
  bookingId: string;
  position: number;
  estimatedWaitTimeMinutes: number;
  bookingsAhead: number;
  status: string;
  message: string;
}
```

### 1.5 Booking Query DTO

**File: `src/modules/booking/dto/booking-query.dto.ts`**
```typescript
import { IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '../../../common/enums';

export class BookingQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
```

### 1.6 Create DTO Index File

**File: `src/modules/booking/dto/index.ts`**
```typescript
export * from './create-booking.dto';
export * from './reject-booking.dto';
export * from './booking-response.dto';
export * from './queue-position.dto';
export * from './booking-query.dto';
```

---

## Step 2: Create Queue Service (30 minutes)

**File: `src/modules/booking/queue.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingStatus } from '../../common/enums';
import { QueuePositionDto } from './dto';

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
```

---

## Step 3: Implement Booking Service (45 minutes)

**File: `src/modules/booking/booking.service.ts`**
```typescript
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
import { CreateBookingDto, RejectBookingDto } from './dto';
import { BookingStatus } from '../../common/enums';

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
  ) {}

  /**
   * Create a new booking (Customer only)
   */
  async create(customerId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const { salonId, serviceIds, preferredTime } = createBookingDto;

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
    const { totalPrice, totalDurationMinutes } =
      this.serviceService.calculateTotals(services);

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
    return await this.findOne(savedBooking.id);
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

    return await this.bookingRepository.save(booking);
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

    return await this.bookingRepository.save(booking);
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

    return await this.bookingRepository.save(booking);
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

    return await this.bookingRepository.save(booking);
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
```

---

## Step 4: Implement Booking Controller (30 minutes)

**File: `src/modules/booking/booking.controller.ts`**
```typescript
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
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';
import { CreateBookingDto, RejectBookingDto, BookingQueryDto } from './dto';

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
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.create(user.id, createBookingDto);
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
```

---

## Step 5: Create Salon Booking Controller (15 minutes)

We need salon-specific booking endpoints for barbers.

**File: `src/modules/salon/salon-booking.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from '../booking/booking.service';
import { QueueService } from '../booking/queue.service';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';
import { BookingQueryDto } from '../booking/dto';

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
```

---

## Step 6: Update Modules (15 minutes)

### 6.1 Update Booking Module

**File: `src/modules/booking/booking.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../entities/booking.entity';
import { BookingService as BookingServiceEntity } from '../../entities/booking-service.entity';
import { Salon } from '../../entities/salon.entity';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { QueueService } from './queue.service';
import { ServiceModule } from '../service/service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingServiceEntity, Salon]),
    ServiceModule, // Import to use ServiceService
  ],
  controllers: [BookingController],
  providers: [BookingService, QueueService],
  exports: [BookingService, QueueService, TypeOrmModule],
})
export class BookingModule {}
```

### 6.2 Update Salon Module

**File: `src/modules/salon/salon.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Salon } from '../../entities/salon.entity';
import { WorkingHours } from '../../entities/working-hours.entity';
import { SalonService } from './salon.service';
import { SalonController } from './salon.controller';
import { SalonScheduler } from './salon.scheduler';
import { SalonBookingController } from './salon-booking.controller'; // Add this
import { BookingModule } from '../booking/booking.module'; // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([Salon, WorkingHours]),
    ScheduleModule.forRoot(),
    BookingModule, // Add this
  ],
  controllers: [SalonController, SalonBookingController], // Add SalonBookingController
  providers: [SalonService, SalonScheduler],
  exports: [SalonService, TypeOrmModule],
})
export class SalonModule {}
```

---

## Step 7: Test the Booking APIs (45 minutes)

### 7.1 Start the Application

```bash
npm run start:dev
```

### 7.2 Preparation

Make sure you have:
1. Customer token (from auth/login)
2. Barber token (from auth/login)
3. Salon ID with working hours set
4. At least 3 active services

### 7.3 Test with Postman/Thunder Client

#### Test 1: Create Booking - Single Service

**Request:**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "salonId": "<salon-id>",
  "serviceIds": ["<haircut-service-id>"],
  "preferredTime": "2024-02-20T14:00:00.000Z"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "booking-uuid-1",
  "status": "PENDING",
  "preferredTime": "2024-02-20T14:00:00.000Z",
  "totalDurationMinutes": 30,
  "totalPrice": 25,
  "rejectionReason": null,
  "acceptedAt": null,
  "completedAt": null,
  "customerId": "customer-id",
  "salonId": "salon-id",
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z",
  "customer": {
    "id": "customer-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "customer@test.com",
    "phone": "+1234567890"
  },
  "salon": {
    "id": "salon-id",
    "name": "Premium Cuts Salon",
    "address": "123 Main Street, New York, NY 10001"
  },
  "bookingServices": [
    {
      "id": "bs-uuid-1",
      "priceAtBooking": 25,
      "durationAtBooking": 30,
      "bookingId": "booking-uuid-1",
      "serviceId": "haircut-service-id",
      "service": {
        "id": "haircut-service-id",
        "name": "Classic Haircut",
        "description": "Traditional men's haircut with styling",
        "price": 25,
        "durationMinutes": 30,
        "isActive": true
      }
    }
  ]
}
```

#### Test 2: Create Booking - Multiple Services

**Request:**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "salonId": "<salon-id>",
  "serviceIds": [
    "<haircut-service-id>",
    "<beard-trim-service-id>"
  ],
  "preferredTime": "2024-02-20T15:00:00.000Z"
}
```

**Expected Response (201 Created):**
```json
{
  "id": "booking-uuid-2",
  "status": "PENDING",
  "totalDurationMinutes": 50,
  "totalPrice": 40,
  "bookingServices": [
    {
      "priceAtBooking": 25,
      "durationAtBooking": 30,
      "service": { "name": "Classic Haircut" }
    },
    {
      "priceAtBooking": 15,
      "durationAtBooking": 20,
      "service": { "name": "Beard Trim & Shape" }
    }
  ],
  ...
}
```

#### Test 3: Get My Bookings

**Request:**
```http
GET http://localhost:3000/api/bookings/my-bookings
Authorization: Bearer <customer-token>
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "booking-uuid-2",
    "status": "PENDING",
    "totalPrice": 40,
    ...
  },
  {
    "id": "booking-uuid-1",
    "status": "PENDING",
    "totalPrice": 25,
    ...
  }
]
```

#### Test 4: Get Salon's Booking Requests (Barber)

**Request:**
```http
GET http://localhost:3000/api/salons/<salon-id>/bookings
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "booking-uuid-2",
    "status": "PENDING",
    "preferredTime": "2024-02-20T15:00:00.000Z",
    "totalPrice": 40,
    "totalDurationMinutes": 50,
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "customer@test.com",
      "phone": "+1234567890"
    },
    "bookingServices": [...]
  },
  {
    "id": "booking-uuid-1",
    "status": "PENDING",
    "totalPrice": 25,
    "totalDurationMinutes": 30,
    ...
  }
]
```

#### Test 5: Accept Booking

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<booking-uuid-1>/accept
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "id": "booking-uuid-1",
  "status": "ACCEPTED",
  "acceptedAt": "2024-02-15T10:05:00.000Z",
  ...
}
```

#### Test 6: Get Queue Position (Customer)

**Request:**
```http
GET http://localhost:3000/api/bookings/<booking-uuid-1>/queue-position
Authorization: Bearer <customer-token>
```

**Expected Response (200 OK):**
```json
{
  "bookingId": "booking-uuid-1",
  "position": 1,
  "estimatedWaitTimeMinutes": 0,
  "bookingsAhead": 0,
  "status": "ACCEPTED",
  "message": "You are #1 in queue. Estimated wait time: 0 minutes."
}
```

#### Test 7: Accept Second Booking

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<booking-uuid-2>/accept
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "id": "booking-uuid-2",
  "status": "ACCEPTED",
  "acceptedAt": "2024-02-15T10:10:00.000Z",
  ...
}
```

#### Test 8: Check Queue Position for Second Booking

**Request:**
```http
GET http://localhost:3000/api/bookings/<booking-uuid-2>/queue-position
Authorization: Bearer <customer-token>
```

**Expected Response (200 OK):**
```json
{
  "bookingId": "booking-uuid-2",
  "position": 2,
  "estimatedWaitTimeMinutes": 30,
  "bookingsAhead": 1,
  "status": "ACCEPTED",
  "message": "You are #2 in queue. Estimated wait time: 30 minutes."
}
```

#### Test 9: Get Salon Queue

**Request:**
```http
GET http://localhost:3000/api/salons/<salon-id>/queue
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "booking-uuid-1",
    "status": "ACCEPTED",
    "acceptedAt": "2024-02-15T10:05:00.000Z",
    "totalDurationMinutes": 30,
    "customer": { "firstName": "John", "lastName": "Doe" },
    ...
  },
  {
    "id": "booking-uuid-2",
    "status": "ACCEPTED",
    "acceptedAt": "2024-02-15T10:10:00.000Z",
    "totalDurationMinutes": 50,
    "customer": { "firstName": "John", "lastName": "Doe" },
    ...
  }
]
```

#### Test 10: Start Service

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<booking-uuid-1>/start
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "id": "booking-uuid-1",
  "status": "IN_PROGRESS",
  ...
}
```

#### Test 11: Check Queue (First Booking In Progress)

**Request:**
```http
GET http://localhost:3000/api/salons/<salon-id>/queue
```

**Expected:** Only booking-uuid-2 appears (IN_PROGRESS bookings not in queue)

#### Test 12: Complete Service

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<booking-uuid-1>/complete
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "id": "booking-uuid-1",
  "status": "COMPLETED",
  "completedAt": "2024-02-15T10:40:00.000Z",
  ...
}
```

#### Test 13: Reject Booking

Create a new booking, then:

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<new-booking-id>/reject
Authorization: Bearer <barber-token>
Content-Type: application/json

{
  "rejectionReason": "Fully booked for today"
}
```

**Expected Response (200 OK):**
```json
{
  "id": "new-booking-id",
  "status": "REJECTED",
  "rejectionReason": "Fully booked for today",
  ...
}
```

#### Test 14: Error - Salon Closed

Close your salon first, then:

**Request:**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "salonId": "<salon-id>",
  "serviceIds": ["<service-id>"],
  "preferredTime": "2024-02-20T14:00:00.000Z"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Salon is currently closed",
  "error": "Bad Request"
}
```

#### Test 15: Error - Duplicate Active Booking

Try creating another booking while you have a PENDING/ACCEPTED booking:

**Request:**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "salonId": "<salon-id>",
  "serviceIds": ["<service-id>"],
  "preferredTime": "2024-02-21T14:00:00.000Z"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "You already have an active booking for this salon. Please wait for it to complete.",
  "error": "Bad Request"
}
```

#### Test 16: Error - Past Preferred Time

**Request:**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "salonId": "<salon-id>",
  "serviceIds": ["<service-id>"],
  "preferredTime": "2024-01-01T14:00:00.000Z"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Preferred time must be in the future",
  "error": "Bad Request"
}
```

#### Test 17: Error - No Services Selected

**Request:**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "salonId": "<salon-id>",
  "serviceIds": [],
  "preferredTime": "2024-02-20T14:00:00.000Z"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "At least one service must be selected"
  ],
  "error": "Bad Request"
}
```

#### Test 18: Error - Inactive Service

Disable a service, then try to book it:

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Some services are not available: <service-id>",
  "error": "Bad Request"
}
```

---

## Step 8: Verify Database (10 minutes)

### 8.1 Check Bookings Table

Go to Supabase → Table Editor → `bookings`

Verify:
- Status transitions (PENDING → ACCEPTED → IN_PROGRESS → COMPLETED)
- Timestamps (acceptedAt, completedAt)
- Total price and duration calculated correctly
- Foreign keys (customerId, salonId)

### 8.2 Check BookingServices Table

Go to Supabase → Table Editor → `booking_services`

Verify:
- Price snapshot (priceAtBooking)
- Duration snapshot (durationAtBooking)
- Multiple services per booking
- Foreign keys (bookingId, serviceId)

---

## 📁 Final Folder Structure

```
src/modules/booking/
├── dto/
│   ├── create-booking.dto.ts ✅
│   ├── reject-booking.dto.ts ✅
│   ├── booking-response.dto.ts ✅
│   ├── queue-position.dto.ts ✅
│   ├── booking-query.dto.ts ✅
│   └── index.ts ✅
├── booking.module.ts ✅
├── booking.service.ts ✅
├── booking.controller.ts ✅
└── queue.service.ts ✅

src/modules/salon/
├── salon-booking.controller.ts ✅ (NEW)
└── ... (existing files)
```

---

## ✅ Verification Checklist

**Customer Flow:**
- [ ] Customer can create booking with single service
- [ ] Customer can create booking with multiple services
- [ ] Customer can view their bookings
- [ ] Customer can see queue position and wait time
- [ ] Customer cannot book when salon is closed
- [ ] Customer cannot have duplicate active bookings
- [ ] Customer cannot book with past preferred time
- [ ] Customer cannot book inactive services

**Barber Flow:**
- [ ] Barber can view salon's booking requests
- [ ] Barber can accept booking
- [ ] Barber can reject booking with reason
- [ ] Barber can start service (move to IN_PROGRESS)
- [ ] Barber can complete service
- [ ] Barber cannot manage other salon's bookings

**Queue Calculation:**
- [ ] Queue position calculated correctly (1-indexed)
- [ ] Wait time calculated as sum of durations ahead
- [ ] Queue ordered by acceptedAt timestamp
- [ ] IN_PROGRESS and COMPLETED bookings not in queue
- [ ] Queue position updates when bookings accepted

**Data Integrity:**
- [ ] Prices snapshotted at booking time
- [ ] Durations snapshotted at booking time
- [ ] Total price = sum of service prices
- [ ] Total duration = sum of service durations
- [ ] Status transitions follow state machine
- [ ] Timestamps recorded correctly

---

## 🎯 What You've Accomplished

✅ **Complete Booking Workflow** - Create → Accept → Start → Complete  
✅ **Multi-Service Bookings** - Select multiple services per booking  
✅ **Queue Management** - Position and wait time calculation  
✅ **Business Rules** - Salon open, no duplicates, future time  
✅ **Price Snapshots** - Preserve prices at booking time  
✅ **Status State Machine** - Proper state transitions  
✅ **Ownership Protection** - Only salon owners manage bookings  
✅ **Real-Time Queue** - Live queue visibility  

---

## 🚀 Next Steps (Phase 6: Notifications)

After booking system is complete:

1. **Email Service Integration** - SendGrid or Nodemailer
2. **Email Templates** - Booking confirmation, acceptance, rejection
3. **Event-Based Notifications** - Trigger on status changes
4. **Notification Logging** - Track sent emails

---

## 🆘 Common Issues & Solutions

### Issue 1: Queue position always 0
**Solution:** Check booking status is ACCEPTED, not PENDING

### Issue 2: Wrong wait time calculation
**Solution:** Verify bookingsAhead query filters by acceptedAt < current booking's acceptedAt

### Issue 3: Duplicate booking error not working
**Solution:** Check all three statuses (PENDING, ACCEPTED, IN_PROGRESS) in query

### Issue 4: Total price/duration wrong
**Solution:** Verify ServiceService.calculateTotals() is summing correctly

### Issue 5: Can't accept booking from different salon
**Solution:** Ownership verification working correctly - this is expected behavior

---

## 💡 Advanced Features (Optional)

Want to enhance the booking system? Consider:

1. **Booking Cancellation** - Allow customers to cancel PENDING bookings
2. **Booking Modification** - Change preferred time before acceptance
3. **No-Show Tracking** - Auto-mark as no-show after X minutes
4. **Booking History** - Completed bookings with ratings
5. **Barber Assignment** - Assign specific barber to booking
6. **Time Slot Suggestions** - Recommend available time slots
7. **Booking Reminders** - Send reminder X hours before
8. **Queue Position Updates** - WebSocket real-time updates

---

**Congratulations! 🎉**

You've built a production-ready booking system with queue management! Customers can book services, barbers can manage requests, and everyone can see real-time queue positions.

**Ready for Phase 6 (Notifications)?** Let me know! 🚀

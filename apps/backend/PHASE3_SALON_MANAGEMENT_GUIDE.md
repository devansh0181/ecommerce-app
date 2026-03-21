# Phase 3: Salon Management APIs - Complete Guide

## 🎯 Goal
Build complete Salon management system with:
- Salon CRUD operations (Create, Read, Update, Delete)
- Working Hours management
- Auto open/close functionality
- Manual status toggle
- Ownership validation
- Public salon browsing with filters

---

## 📋 What We'll Build

### Salon Endpoints (Barber):
1. `POST /api/salons` - Create salon (Barber only)
2. `PUT /api/salons/:id` - Update salon (Owner only)
3. `DELETE /api/salons/:id` - Delete salon (Owner only)
4. `PATCH /api/salons/:id/toggle-status` - Manual open/close (Owner only)

### Salon Endpoints (Public):
5. `GET /api/salons` - List all salons with filters
6. `GET /api/salons/:id` - Get salon details

### Working Hours Endpoints:
7. `GET /api/salons/:id/working-hours` - Get salon working hours
8. `PUT /api/salons/:id/working-hours` - Set/update working hours (Owner only)

---

## Step 1: Create DTOs (20 minutes)

### 1.1 Create Salon DTOs

**File: `src/modules/salon/dto/create-salon.dto.ts`**
```typescript
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateSalonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
```

**File: `src/modules/salon/dto/update-salon.dto.ts`**
```typescript
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateSalonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
```

**File: `src/modules/salon/dto/salon-response.dto.ts`**
```typescript
export class SalonResponseDto {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  isOpen: boolean;
  openedAt: Date;
  closedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

### 1.2 Create Working Hours DTOs

**File: `src/modules/salon/dto/working-hours.dto.ts`**
```typescript
import { IsEnum, IsString, IsBoolean, IsOptional, Matches } from 'class-validator';
import { DayOfWeek } from '../../../common/enums';

export class WorkingHoursItemDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'openTime must be in HH:MM:SS format',
  })
  openTime: string; // Format: "09:00:00"

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'closeTime must be in HH:MM:SS format',
  })
  closeTime: string; // Format: "18:00:00"

  @IsBoolean()
  @IsOptional()
  isClosed?: boolean; // If true, salon is closed this day
}

export class UpdateWorkingHoursDto {
  workingHours: WorkingHoursItemDto[];
}
```

### 1.3 Create Query DTOs

**File: `src/modules/salon/dto/salon-query.dto.ts`**
```typescript
import { IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SalonQueryDto {
  @IsOptional()
  @IsString()
  search?: string; // Search by name or address

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isOpen?: boolean; // Filter by open status

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minRating?: number; // Filter by minimum rating

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
```

### 1.4 Create DTO Index File

**File: `src/modules/salon/dto/index.ts`**
```typescript
export * from './create-salon.dto';
export * from './update-salon.dto';
export * from './salon-response.dto';
export * from './working-hours.dto';
export * from './salon-query.dto';
```

---

## Step 2: Implement Salon Service (40 minutes)

**File: `src/modules/salon/salon.service.ts`**
```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Salon } from '../../entities/salon.entity';
import { WorkingHours } from '../../entities/working-hours.entity';
import { User } from '../../entities/user.entity';
import {
  CreateSalonDto,
  UpdateSalonDto,
  UpdateWorkingHoursDto,
  SalonQueryDto,
} from './dto';

@Injectable()
export class SalonService {
  constructor(
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
    @InjectRepository(WorkingHours)
    private workingHoursRepository: Repository<WorkingHours>,
  ) {}

  /**
   * Create a new salon (Barber only)
   */
  async create(ownerId: string, createSalonDto: CreateSalonDto): Promise<Salon> {
    const salon = this.salonRepository.create({
      ...createSalonDto,
      ownerId,
      isOpen: false, // Start as closed
      rating: 0,
    });

    return await this.salonRepository.save(salon);
  }

  /**
   * Get all salons with filters and pagination
   */
  async findAll(query: SalonQueryDto): Promise<{
    data: Salon[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { search, isOpen, minRating, page = 1, limit = 10 } = query;

    const queryBuilder = this.salonRepository
      .createQueryBuilder('salon')
      .leftJoinAndSelect('salon.owner', 'owner')
      .select([
        'salon.id',
        'salon.name',
        'salon.description',
        'salon.address',
        'salon.latitude',
        'salon.longitude',
        'salon.rating',
        'salon.isOpen',
        'salon.createdAt',
        'salon.updatedAt',
        'owner.id',
        'owner.firstName',
        'owner.lastName',
      ]);

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(salon.name ILIKE :search OR salon.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply isOpen filter
    if (isOpen !== undefined) {
      queryBuilder.andWhere('salon.isOpen = :isOpen', { isOpen });
    }

    // Apply rating filter
    if (minRating !== undefined) {
      queryBuilder.andWhere('salon.rating >= :minRating', { minRating });
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by rating and creation date
    queryBuilder.orderBy('salon.rating', 'DESC').addOrderBy('salon.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get salon by ID with details
   */
  async findOne(id: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id },
      relations: ['owner', 'workingHours', 'services'],
      select: {
        owner: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    return salon;
  }

  /**
   * Get salons by owner ID (for barber dashboard)
   */
  async findByOwner(ownerId: string): Promise<Salon[]> {
    return await this.salonRepository.find({
      where: { ownerId },
      relations: ['workingHours', 'services'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update salon (Owner only)
   */
  async update(
    id: string,
    ownerId: string,
    updateSalonDto: UpdateSalonDto,
  ): Promise<Salon> {
    const salon = await this.findOne(id);

    // Check ownership
    if (salon.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own salons');
    }

    Object.assign(salon, updateSalonDto);
    return await this.salonRepository.save(salon);
  }

  /**
   * Delete salon (Owner only)
   */
  async remove(id: string, ownerId: string): Promise<{ message: string }> {
    const salon = await this.findOne(id);

    // Check ownership
    if (salon.ownerId !== ownerId) {
      throw new ForbiddenException('You can only delete your own salons');
    }

    await this.salonRepository.remove(salon);
    return { message: 'Salon deleted successfully' };
  }

  /**
   * Toggle salon open/close status manually (Owner only)
   */
  async toggleStatus(id: string, ownerId: string): Promise<Salon> {
    const salon = await this.findOne(id);

    // Check ownership
    if (salon.ownerId !== ownerId) {
      throw new ForbiddenException('You can only toggle your own salon status');
    }

    salon.isOpen = !salon.isOpen;

    if (salon.isOpen) {
      salon.openedAt = new Date();
    } else {
      salon.closedAt = new Date();
    }

    return await this.salonRepository.save(salon);
  }

  /**
   * Get working hours for a salon
   */
  async getWorkingHours(salonId: string): Promise<WorkingHours[]> {
    await this.findOne(salonId); // Verify salon exists

    return await this.workingHoursRepository.find({
      where: { salonId },
      order: { dayOfWeek: 'ASC' },
    });
  }

  /**
   * Set/Update working hours (Owner only)
   */
  async updateWorkingHours(
    salonId: string,
    ownerId: string,
    updateDto: UpdateWorkingHoursDto,
  ): Promise<WorkingHours[]> {
    const salon = await this.findOne(salonId);

    // Check ownership
    if (salon.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own salon working hours');
    }

    // Delete existing working hours
    await this.workingHoursRepository.delete({ salonId });

    // Create new working hours
    const workingHours = updateDto.workingHours.map((item) => {
      return this.workingHoursRepository.create({
        ...item,
        salonId,
      });
    });

    return await this.workingHoursRepository.save(workingHours);
  }

  /**
   * Check if salon should be open based on working hours
   * (Will be used by scheduled job later)
   */
  async checkAndUpdateOpenStatus(salonId: string): Promise<void> {
    const salon = await this.findOne(salonId);
    const workingHours = await this.getWorkingHours(salonId);

    if (workingHours.length === 0) {
      return; // No working hours set, keep manual status
    }

    const now = new Date();
    const dayOfWeek = this.getDayOfWeek(now.getDay());
    const currentTime = this.formatTime(now);

    const todayHours = workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);

    if (!todayHours || todayHours.isClosed) {
      // Should be closed
      if (salon.isOpen) {
        salon.isOpen = false;
        salon.closedAt = now;
        await this.salonRepository.save(salon);
      }
      return;
    }

    const shouldBeOpen =
      currentTime >= todayHours.openTime && currentTime < todayHours.closeTime;

    if (shouldBeOpen && !salon.isOpen) {
      salon.isOpen = true;
      salon.openedAt = now;
      await this.salonRepository.save(salon);
    } else if (!shouldBeOpen && salon.isOpen) {
      salon.isOpen = false;
      salon.closedAt = now;
      await this.salonRepository.save(salon);
    }
  }

  /**
   * Auto-update all salons open/close status
   * (Called by scheduled job)
   */
  async autoUpdateAllSalonsStatus(): Promise<void> {
    const salons = await this.salonRepository.find();

    for (const salon of salons) {
      await this.checkAndUpdateOpenStatus(salon.id);
    }

    console.log(`✅ Auto-updated ${salons.length} salon(s) open/close status`);
  }

  /**
   * Helper: Get day of week enum from JS day number
   */
  private getDayOfWeek(dayNumber: number): string {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[dayNumber];
  }

  /**
   * Helper: Format time as HH:MM:SS
   */
  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }
}
```

---

## Step 3: Implement Salon Controller (25 minutes)

**File: `src/modules/salon/salon.controller.ts`**
```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SalonService } from './salon.service';
import { JwtAuthGuard } from '../auth/guards';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums';
import {
  CreateSalonDto,
  UpdateSalonDto,
  UpdateWorkingHoursDto,
  SalonQueryDto,
} from './dto';

@Controller('salons')
export class SalonController {
  constructor(private readonly salonService: SalonService) {}

  /**
   * POST /api/salons
   * Create a new salon (Barber only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() createSalonDto: CreateSalonDto,
  ) {
    return this.salonService.create(user.id, createSalonDto);
  }

  /**
   * GET /api/salons
   * Get all salons with filters (Public)
   */
  @Get()
  async findAll(@Query() query: SalonQueryDto) {
    return this.salonService.findAll(query);
  }

  /**
   * GET /api/salons/my-salons
   * Get current barber's salons
   */
  @Get('my-salons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async getMySlons(@CurrentUser() user: User) {
    return this.salonService.findByOwner(user.id);
  }

  /**
   * GET /api/salons/:id
   * Get salon by ID with details (Public)
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.salonService.findOne(id);
  }

  /**
   * PUT /api/salons/:id
   * Update salon (Owner only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateSalonDto: UpdateSalonDto,
  ) {
    return this.salonService.update(id, user.id, updateSalonDto);
  }

  /**
   * DELETE /api/salons/:id
   * Delete salon (Owner only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.salonService.remove(id, user.id);
  }

  /**
   * PATCH /api/salons/:id/toggle-status
   * Toggle salon open/close (Owner only)
   */
  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async toggleStatus(@Param('id') id: string, @CurrentUser() user: User) {
    return this.salonService.toggleStatus(id, user.id);
  }

  /**
   * GET /api/salons/:id/working-hours
   * Get salon working hours (Public)
   */
  @Get(':id/working-hours')
  async getWorkingHours(@Param('id') id: string) {
    return this.salonService.getWorkingHours(id);
  }

  /**
   * PUT /api/salons/:id/working-hours
   * Set/update working hours (Owner only)
   */
  @Put(':id/working-hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async updateWorkingHours(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateDto: UpdateWorkingHoursDto,
  ) {
    return this.salonService.updateWorkingHours(id, user.id, updateDto);
  }
}
```

---

## Step 4: Update Salon Module (5 minutes)

**File: `src/modules/salon/salon.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from '../../entities/salon.entity';
import { WorkingHours } from '../../entities/working-hours.entity';
import { SalonService } from './salon.service';
import { SalonController } from './salon.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Salon, WorkingHours])],
  controllers: [SalonController],
  providers: [SalonService],
  exports: [SalonService, TypeOrmModule],
})
export class SalonModule {}
```

---

## Step 5: Create Scheduled Job for Auto Open/Close (15 minutes)

### 5.1 Install Scheduler Package

```bash
npm install @nestjs/schedule
```

### 5.2 Create Scheduled Task Service

**File: `src/modules/salon/salon.scheduler.ts`**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalonService } from './salon.service';

@Injectable()
export class SalonScheduler {
  private readonly logger = new Logger(SalonScheduler.name);

  constructor(private readonly salonService: SalonService) {}

  /**
   * Auto-update salon status every 15 minutes
   * Runs at: :00, :15, :30, :45 of every hour
   */
  @Cron(CronExpression.EVERY_15_MINUTES)
  async handleSalonStatusUpdate() {
    this.logger.log('Running auto salon status update...');
    try {
      await this.salonService.autoUpdateAllSalonsStatus();
      this.logger.log('✅ Salon status update completed');
    } catch (error) {
      this.logger.error('❌ Failed to update salon status', error);
    }
  }

  /**
   * Alternative: Run every minute for more real-time updates
   * Uncomment below and comment above if needed
   */
  // @Cron(CronExpression.EVERY_MINUTE)
  // async handleSalonStatusUpdateEveryMinute() {
  //   this.logger.log('Running auto salon status update...');
  //   await this.salonService.autoUpdateAllSalonsStatus();
  // }
}
```

### 5.3 Update Salon Module to Include Scheduler

**File: `src/modules/salon/salon.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // Add this
import { Salon } from '../../entities/salon.entity';
import { WorkingHours } from '../../entities/working-hours.entity';
import { SalonService } from './salon.service';
import { SalonController } from './salon.controller';
import { SalonScheduler } from './salon.scheduler'; // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([Salon, WorkingHours]),
    ScheduleModule.forRoot(), // Add this
  ],
  controllers: [SalonController],
  providers: [SalonService, SalonScheduler], // Add SalonScheduler
  exports: [SalonService, TypeOrmModule],
})
export class SalonModule {}
```

---

## Step 6: Test the Salon APIs (30 minutes)

### 6.1 Start the Application

```bash
npm run start:dev
```

Look for scheduler logs:
```
[SalonScheduler] Running auto salon status update...
✅ Auto-updated 0 salon(s) open/close status
```

### 6.2 Test with Postman/Thunder Client

#### Test 1: Create Salon (Barber Only)

**Request:**
```http
POST http://localhost:3000/api/salons
Authorization: Bearer <barber-token>
Content-Type: application/json

{
  "name": "Premium Cuts Salon",
  "description": "Best haircuts and grooming services in town",
  "address": "123 Main Street, New York, NY 10001",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Expected Response (201 Created):**
```json
{
  "id": "uuid-here",
  "name": "Premium Cuts Salon",
  "description": "Best haircuts and grooming services in town",
  "address": "123 Main Street, New York, NY 10001",
  "latitude": 40.7128,
  "longitude": -74.006,
  "rating": 0,
  "isOpen": false,
  "openedAt": null,
  "closedAt": null,
  "ownerId": "barber-user-id",
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z"
}
```

#### Test 2: Get All Salons (Public)

**Request:**
```http
GET http://localhost:3000/api/salons
```

**Expected Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "name": "Premium Cuts Salon",
      "description": "Best haircuts and grooming services in town",
      "address": "123 Main Street, New York, NY 10001",
      "latitude": 40.7128,
      "longitude": -74.006,
      "rating": 0,
      "isOpen": false,
      "createdAt": "2024-02-15T10:00:00.000Z",
      "updatedAt": "2024-02-15T10:00:00.000Z",
      "owner": {
        "id": "barber-id",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Test 3: Get Salon by ID (Public)

**Request:**
```http
GET http://localhost:3000/api/salons/<salon-id>
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Premium Cuts Salon",
  "description": "Best haircuts and grooming services in town",
  "address": "123 Main Street, New York, NY 10001",
  "latitude": 40.7128,
  "longitude": -74.006,
  "rating": 0,
  "isOpen": false,
  "openedAt": null,
  "closedAt": null,
  "ownerId": "barber-id",
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z",
  "owner": {
    "id": "barber-id",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "barber@test.com"
  },
  "workingHours": [],
  "services": []
}
```

#### Test 4: Update Salon (Owner Only)

**Request:**
```http
PUT http://localhost:3000/api/salons/<salon-id>
Authorization: Bearer <barber-token>
Content-Type: application/json

{
  "name": "Premium Cuts & Spa",
  "description": "Updated description with spa services"
}
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Premium Cuts & Spa",
  "description": "Updated description with spa services",
  "address": "123 Main Street, New York, NY 10001",
  ...
}
```

#### Test 5: Set Working Hours (Owner Only)

**Request:**
```http
PUT http://localhost:3000/api/salons/<salon-id>/working-hours
Authorization: Bearer <barber-token>
Content-Type: application/json

{
  "workingHours": [
    {
      "dayOfWeek": "MONDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "TUESDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "THURSDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "FRIDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "SATURDAY",
      "openTime": "10:00:00",
      "closeTime": "16:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "SUNDAY",
      "openTime": "00:00:00",
      "closeTime": "00:00:00",
      "isClosed": true
    }
  ]
}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "dayOfWeek": "MONDAY",
    "openTime": "09:00:00",
    "closeTime": "18:00:00",
    "isClosed": false,
    "salonId": "salon-id"
  },
  {
    "id": "uuid-2",
    "dayOfWeek": "TUESDAY",
    "openTime": "09:00:00",
    "closeTime": "18:00:00",
    "isClosed": false,
    "salonId": "salon-id"
  },
  ...
]
```

#### Test 6: Toggle Salon Status (Owner Only)

**Request:**
```http
PATCH http://localhost:3000/api/salons/<salon-id>/toggle-status
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Premium Cuts & Spa",
  "isOpen": true,
  "openedAt": "2024-02-15T14:30:00.000Z",
  "closedAt": null,
  ...
}
```

**Second Toggle:**
```http
PATCH http://localhost:3000/api/salons/<salon-id>/toggle-status
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "name": "Premium Cuts & Spa",
  "isOpen": false,
  "openedAt": "2024-02-15T14:30:00.000Z",
  "closedAt": "2024-02-15T14:32:00.000Z",
  ...
}
```

#### Test 7: Get My Salons (Barber Only)

**Request:**
```http
GET http://localhost:3000/api/salons/my-salons
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "uuid-here",
    "name": "Premium Cuts & Spa",
    "description": "Updated description with spa services",
    "address": "123 Main Street, New York, NY 10001",
    "isOpen": false,
    "rating": 0,
    "workingHours": [...],
    "services": [],
    ...
  }
]
```

#### Test 8: Search Salons with Filters

**Request:**
```http
GET http://localhost:3000/api/salons?search=Premium&isOpen=true&minRating=4&page=1&limit=5
```

**Expected Response (200 OK):**
```json
{
  "data": [...],
  "total": 0,
  "page": 1,
  "limit": 5
}
```

#### Test 9: Delete Salon (Owner Only)

**Request:**
```http
DELETE http://localhost:3000/api/salons/<salon-id>
Authorization: Bearer <barber-token>
```

**Expected Response (200 OK):**
```json
{
  "message": "Salon deleted successfully"
}
```

#### Test 10: Error - Non-owner tries to update

**Request:**
```http
PUT http://localhost:3000/api/salons/<salon-id>
Authorization: Bearer <different-barber-token>
Content-Type: application/json

{
  "name": "Hacked Salon"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "You can only update your own salons",
  "error": "Forbidden"
}
```

#### Test 11: Error - Customer tries to create salon

**Request:**
```http
POST http://localhost:3000/api/salons
Authorization: Bearer <customer-token>
Content-Type: application/json

{
  "name": "Test Salon",
  "address": "Test Address"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Step 7: Test Auto Open/Close Feature (10 minutes)

### 7.1 Set Working Hours for Current Day/Time

For example, if it's currently **Tuesday at 2:00 PM**, set:

```json
{
  "workingHours": [
    {
      "dayOfWeek": "TUESDAY",
      "openTime": "13:00:00",
      "closeTime": "15:00:00",
      "isClosed": false
    }
  ]
}
```

### 7.2 Wait for Scheduler to Run

The scheduler runs every 15 minutes. Watch the logs:

```
[SalonScheduler] Running auto salon status update...
✅ Auto-updated 1 salon(s) open/close status
[SalonScheduler] ✅ Salon status update completed
```

### 7.3 Check Salon Status

```http
GET http://localhost:3000/api/salons/<salon-id>
```

You should see `"isOpen": true`

### 7.4 Test Auto-Close

Update working hours to a past time:

```json
{
  "workingHours": [
    {
      "dayOfWeek": "TUESDAY",
      "openTime": "09:00:00",
      "closeTime": "12:00:00",
      "isClosed": false
    }
  ]
}
```

Wait for next scheduler run, then check:
```http
GET http://localhost:3000/api/salons/<salon-id>
```

You should see `"isOpen": false`

---

## 📁 Final Folder Structure

```
src/modules/salon/
├── dto/
│   ├── create-salon.dto.ts ✅
│   ├── update-salon.dto.ts ✅
│   ├── salon-response.dto.ts ✅
│   ├── working-hours.dto.ts ✅
│   ├── salon-query.dto.ts ✅
│   └── index.ts ✅
├── salon.module.ts ✅
├── salon.service.ts ✅
├── salon.controller.ts ✅
└── salon.scheduler.ts ✅
```

---

## ✅ Verification Checklist

- [ ] Barber can create salons
- [ ] Barber can view their salons
- [ ] Barber can update their salons
- [ ] Barber can delete their salons
- [ ] Barber can toggle salon status manually
- [ ] Barber can set working hours
- [ ] Public can view all salons
- [ ] Public can filter salons (search, isOpen, rating)
- [ ] Public can view salon details
- [ ] Pagination works correctly
- [ ] Auto open/close based on working hours works
- [ ] Scheduler runs every 15 minutes
- [ ] Ownership validation prevents unauthorized access
- [ ] Customer cannot create/update salons

---

## 🎯 What You've Accomplished

✅ **Complete Salon CRUD** - Create, Read, Update, Delete  
✅ **Working Hours Management** - Set business hours for each day  
✅ **Auto Open/Close** - Automated status based on working hours  
✅ **Manual Override** - Barbers can manually toggle status  
✅ **Public Browsing** - Customers can search and filter salons  
✅ **Ownership Protection** - Only owners can modify their salons  
✅ **Pagination** - Efficient data loading  
✅ **Scheduled Jobs** - Background tasks with NestJS Schedule  

---

## 🚀 Next Steps (Phase 4)

After salon management is complete:

1. **Service Management APIs** - Allow barbers to create salon services
2. **Booking System** - Let customers book appointments
3. **Queue Management** - Calculate wait times and positions
4. **Notifications** - Email alerts for booking status

---

## 🆘 Common Issues & Solutions

### Issue 1: Scheduler not running
**Solution:** Make sure `ScheduleModule.forRoot()` is imported in salon.module.ts

### Issue 2: Working hours validation fails
**Solution:** Time must be in `HH:MM:SS` format (e.g., "09:00:00", not "9:00")

### Issue 3: Can't filter by isOpen
**Solution:** Query param must be string "true" or "false", handled by @Transform decorator

### Issue 4: Pagination returns empty results
**Solution:** Check if page/limit are numbers. Use @Type(() => Number) decorator

### Issue 5: Auto-update not working
**Solution:** Verify working hours match current day and time zone

---

**Congratulations! 🎉**

You now have a complete Salon Management system. Barbers can create and manage their salons, set working hours, and the system automatically opens/closes salons based on the schedule.

**Ready for Service Management (Phase 4)?** Let me know! 🚀

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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateSalonDto } from './dto/create-salon.dto';
import { SalonQueryDto } from './dto/salon-query.dto';
import { UpdateWorkingHoursDto } from './dto/working-hours.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
@Controller('salons')
/*
Salon Endpoints (Barber):

POST /api/salons - Create salon (Barber only) -> done
PUT /api/salons/:id - Update salon (Owner only) -> done
DELETE /api/salons/:id - Delete salon (Owner only)
PATCH /api/salons/:id/toggle-status - Manual open/close (Owner only)

Salon Endpoints (Public):

GET /api/salons - List all salons with filters -> done
GET /api/salons/:id - Get salon details -> done

Working Hours Endpoints:

GET /api/salons/:id/working-hours - Get salon working hours
PUT /api/salons/:id/working-hours - Set/update working hours (Owner only) 
*/
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
    @Body() requestData: CreateSalonDto,
  ) {
    const reqData = {
        ...requestData,
        ownerId: user.id
    };
    return this.salonService.create(reqData);
  }

  /**
   * GET /api/salons
   * Get all salons with filters (Public)
   */
  @Get()
  async getAllSalons(@Query() query: SalonQueryDto) {
    return this.salonService.getAllSalons(query);
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
    @Body() reqData: UpdateSalonDto,
  ) {
    return this.salonService.update(id, user.id, reqData);
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
    @Body() reqData: UpdateWorkingHoursDto,
  ) {
    return this.salonService.updateWorkingHours(id, user.id, reqData);
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
}
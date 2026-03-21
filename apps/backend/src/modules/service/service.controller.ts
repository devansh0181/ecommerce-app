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
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('salons/:salonId/services')
/*
Service Endpoints (Barber - Owner Only):

POST /api/salons/:salonId/services - Create service -> done
PUT /api/salons/:salonId/services/:id - Update service -> done
DELETE /api/salons/:salonId/services/:id - Delete service -> done
PATCH /api/salons/:salonId/services/:id/toggle - Enable/disable service -> done

Service Endpoints (Public):

GET /api/salons/:salonId/services - Get all services for a salon -> done
GET /api/salons/:salonId/services/:id - Get service details -> done
*/
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  /**
   * POST /api/salons/:salonId/services
   * Create a new service (Barber/Owner only)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('salonId') salonId: string,
    @CurrentUser() user: User,
    @Body() createServiceDto: CreateServiceDto,
  ) {
    return this.serviceService.create(salonId, user.id, createServiceDto);
  }

  /**
   * GET /api/salons/:salonId/services
   * Get all services for a salon (Public)
   * Query params: includeInactive (for salon owner)
   */
  @Get()
  async findAll(
    @Param('salonId') salonId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    const showInactive = includeInactive === 'true';
    return this.serviceService.findBySalon(salonId, showInactive);
  }

  /**
   * GET /api/salons/:salonId/services/:id
   * Get service details (Public)
   */
  @Get(':id')
  async findOne(
    @Param('salonId') salonId: string,
    @Param('id') id: string,
  ) {
    return this.serviceService.findOne(salonId, id);
  }

  /**
   * PUT /api/salons/:salonId/services/:id
   * Update service (Owner only)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async update(
    @Param('salonId') salonId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return this.serviceService.update(salonId, id, user.id, updateServiceDto);
  }

  /**
   * DELETE /api/salons/:salonId/services/:id
   * Soft delete service (Owner only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('salonId') salonId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.serviceService.remove(salonId, id, user.id);
  }

  /**
   * PATCH /api/salons/:salonId/services/:id/toggle
   * Toggle service active/inactive (Owner only)
   */
  @Patch(':id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  async toggleActive(
    @Param('salonId') salonId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.serviceService.toggleActive(salonId, id, user.id);
  }

  /**
   * DELETE /api/salons/:salonId/services/:id/hard
   * Hard delete service (Owner only, use with caution)
   */
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BARBER)
  @HttpCode(HttpStatus.OK)
  async hardRemove(
    @Param('salonId') salonId: string,
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.serviceService.hardRemove(salonId, id, user.id);
  }
}
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { Salon } from '../../entities/salon.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Salon)
    private salonRepository: Repository<Salon>,
  ) {}

  /**
   * Create a new service for a salon (Owner only)
   */
  async create(
    salonId: string,
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    // Verify salon exists and user is owner
    await this.verifySalonOwnership(salonId, userId);

    // Create service
    const salonCreateData={
      ...createServiceDto,
      salonId,
      isActive: true, // Services are active by default
    }
    const data=this.serviceRepository.save(salonCreateData);
    return data;
  }

  /**
   * Get all services for a salon (Public)
   */
  async findBySalon(salonId: string, includeInactive = false): Promise<Service[]> {
    // Verify salon exists
    await this.verifySalonExists(salonId);

    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .where('service.salonId = :salonId', { salonId });

    // Filter out inactive services for public view
    if (!includeInactive) {
      queryBuilder.andWhere('service.isActive = :isActive', { isActive: true });
    }

    queryBuilder.orderBy('service.createdAt', 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Get service by ID
   */
  async findOne(salonId: string, serviceId: string): Promise<Service> {
    //here relation means bring salon details along with service
    const service = await this.serviceRepository.findOne({
      where: { id: serviceId, salonId:salonId },
      relations: ['salon'],
    });
    //with query builder
    // const service = await this.serviceRepository
    // .createQueryBuilder('service')
    // .leftJoinAndSelect('service.salon', 'salon')
    // .where('service.id = :serviceId', { serviceId })
    // .andWhere('service.salonId = :salonId', { salonId })
    // .getOne();

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  /**
   * Update service (Owner only)
   */
  async update(
    salonId: string,
    serviceId: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    // Verify salon ownership
    await this.verifySalonOwnership(salonId, userId);

    // Find service
    const service = await this.findOne(salonId, serviceId);

    // Update service
    Object.assign(service, updateServiceDto);

    return await this.serviceRepository.save(service);
  }

  /**
   * Delete service (Owner only)
   * Note: This is soft delete - we set isActive to false
   * to preserve data integrity for existing bookings
   */
  async remove(
    salonId: string,
    serviceId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Verify salon ownership
    await this.verifySalonOwnership(salonId, userId);

    // Find service
    const service = await this.findOne(salonId, serviceId);

    // Soft delete: Set isActive to false
    service.isActive = false;
    await this.serviceRepository.save(service);

    return { message: 'Service deactivated successfully' };
  }

  /**
   * Hard delete service (Owner only)
   * Use with caution - only if service has no bookings
   */
  async hardRemove(
    salonId: string,
    serviceId: string,
    userId: string,
  ): Promise<{ message: string }> {
    // Verify salon ownership
    await this.verifySalonOwnership(salonId, userId);

    // Find service
    const service = await this.findOne(salonId, serviceId);

    // Check if service has any bookings
    // TODO: Add this check when booking module is implemented
    // const hasBookings = await this.checkServiceHasBookings(serviceId);
    // if (hasBookings) {
    //   throw new BadRequestException('Cannot delete service with existing bookings');
    // }

    // Hard delete
    await this.serviceRepository.remove(service);

    return { message: 'Service deleted permanently' };
  }

  /**
   * Toggle service active status (Owner only)
   */
  async toggleActive(
    salonId: string,
    serviceId: string,
    userId: string,
  ): Promise<Service> {
    // Verify salon ownership
    await this.verifySalonOwnership(salonId, userId);

    // Find service
    const service = await this.findOne(salonId, serviceId);

    // Toggle active status
    service.isActive = !service.isActive;

    return await this.serviceRepository.save(service);
  }

  /**
   * Get active services for booking
   * (Used by booking module to validate service selection)
   */
  async getActiveServicesByIds(
    salonId: string,
    serviceIds: string[],
  ): Promise<Service[]> {
    if (serviceIds.length === 0) {
      return [];
    }

    const services = await this.serviceRepository
      .createQueryBuilder('service')
      .where('service.salonId = :salonId', { salonId })
      .andWhere('service.id IN (:...serviceIds)', { serviceIds })
      .andWhere('service.isActive = :isActive', { isActive: true })
      .getMany();

    // Verify all requested services were found
    if (services.length !== serviceIds.length) {
      const foundIds = services.map((s) => s.id);
      const missingIds = serviceIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestException(
        `Some services are not available: ${missingIds.join(', ')}`,
      );
    }

    return services;
  }

  /**
   * Calculate total price and duration for multiple services
   * (Used by booking module)
   */
  calculateTotals(services: Service[]): {
    totalPrice: number;
    totalDurationMinutes: number;
  } {
    const totalPrice = services.reduce(
      (sum, service) => sum + Number(service.price),
      0,
    );
    const totalDurationMinutes = services.reduce(
      (sum, service) => sum + service.durationMinutes,
      0,
    );

    return {
      totalPrice: Number(totalPrice.toFixed(2)),
      totalDurationMinutes,
    };
  }

  /**
   * Helper: Verify salon exists
   */
  private async verifySalonExists(salonId: string): Promise<Salon> {
    const salon = await this.salonRepository.findOne({
      where: { id: salonId },
    });

    if (!salon) {
      throw new NotFoundException('Salon not found');
    }

    return salon;
  }

  /**
   * Helper: Verify salon ownership
   */
  private async verifySalonOwnership(
    salonId: string,
    userId: string,
  ): Promise<Salon> {
    const salon = await this.verifySalonExists(salonId);

    if (salon.ownerId !== userId) {
      throw new ForbiddenException('You can only manage services for your own salon');
    }

    return salon;
  }
}
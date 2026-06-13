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
import { CreateSalonDto } from './dto/create-salon.dto';
import { SalonQueryDto } from './dto/salon-query.dto';
import { UpdateWorkingHoursDto } from './dto/working-hours.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';

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
  async create(requestData: CreateSalonDto): Promise<Salon> {
    const salonRepo=this.salonRepository;
    const salonCreateData={
      ...requestData,
      isOpen: false, // Start as closed
      rating: 0,
    }
    const data=salonRepo.save(salonCreateData);
    return data
  }

  /**
   * Get all salons with filters and pagination
   */
  async getAllSalons(query: SalonQueryDto): Promise<{
    data: Salon[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { search, isOpen, minRating, page = 1, limit = 10 } = query;

    const queryBuilder = this.salonRepository
      .createQueryBuilder('salon')
      .leftJoinAndSelect('salon.user', 'user')
      .select([
        'salon',
        'user.id',
        'user.firstName',
        'user.lastName',
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

    // Only return salons that have at least one active service
    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('1')
        .from('services', 'service')
        .where('service.salonId = salon.id')
        .andWhere('service.isActive = :serviceActive', { serviceActive: true })
        .getQuery();
      return `EXISTS ${subQuery}`;
    });

    // Only return salons that have at least one working hours setup
    queryBuilder.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('1')
        .from('working_hours', 'working_hour')
        .where('working_hour.salonId = salon.id')
        .getQuery();
      return `EXISTS ${subQuery}`;
    });

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
      relations: ['user', 'workingHours', 'services'],
      select: {
        user: {
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
    reqData: UpdateSalonDto,
  ): Promise<Salon> {
    const salon = await this.findOne(id);

    // Check ownership
    if (salon.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own salons');
    }

    // await this.salonRepository.update({ id }, reqData);
    // return await this.findOne(id);
    Object.assign(salon, reqData);
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
    reqData: UpdateWorkingHoursDto,
  ): Promise<WorkingHours[]> {
    const salon = await this.findOne(salonId);

    // Check ownership
    if (salon.ownerId !== ownerId) {
      throw new ForbiddenException('You can only update your own salon working hours');
    }

    // Delete existing working hours
    await this.workingHoursRepository.delete({ salonId });

    // Create new working hours
    const workingHours = reqData.workingHours.map((item) => {
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
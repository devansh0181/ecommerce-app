import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SalonService } from './salon.service';


// Define it manually
const EVERY_15_MINUTES = '0 */15 * * * *';

@Injectable()
export class SalonScheduler {
  private readonly logger = new Logger(SalonScheduler.name);

  constructor(private readonly salonService: SalonService) {}

  /**
   * Auto-update salon status every 15 minutes
   * Runs at: :00, :15, :30, :45 of every hour
   */
  @Cron(EVERY_15_MINUTES)
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
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule implements OnModuleInit {
  private readonly logger = new Logger(NotificationModule.name);

  onModuleInit() {
    this.logger.log('✅ [MailerModule] Email service configured successfully');
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { Booking } from '../../entities/booking.entity';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Send booking created notification to barber
   */
  async sendBookingCreatedNotification(booking: Booking): Promise<void> {
    try {
      const barber = booking.salon.user;
      const customer = booking.customer;
      const services = booking.bookingServices;

      const frontendUrl = this.configService.get('email.frontendUrl');

      await this.mailerService.sendMail({
        to: barber.email,
        subject: `New Booking Request - ${customer.firstName} ${customer.lastName}`,
        template: 'booking-created',
        context: {
          barberFirstName: barber.firstName,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          customerPhone: customer.phone || 'N/A',
          preferredTime: this.formatDate(booking.preferredTime),
          totalDuration: booking.totalDurationMinutes,
          totalPrice: Number(booking.totalPrice).toFixed(2),
          services: services.map((bs) => ({
            name: bs.service.name,
            duration: bs.durationAtBooking,
            price: Number(bs.priceAtBooking).toFixed(2),
          })),
          dashboardUrl: `${frontendUrl}/barber/dashboard`,
        },
      });

      this.logger.log(`✅ Booking created email sent to ${barber.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to send booking created email', error);
      throw error;
    }
  }

  /**
   * Send booking accepted notification to customer
   */
  async sendBookingAcceptedNotification(booking: Booking): Promise<void> {
    try {
      const customer = booking.customer;
      const salon = booking.salon;
      const services = booking.bookingServices;

      const frontendUrl = this.configService.get('email.frontendUrl');

      await this.mailerService.sendMail({
        to: customer.email,
        subject: `Booking Confirmed - ${salon.name}`,
        template: 'booking-accepted',
        context: {
          customerFirstName: customer.firstName,
          salonName: salon.name,
          salonAddress: salon.address,
          preferredTime: this.formatDate(booking.preferredTime),
          totalDuration: booking.totalDurationMinutes,
          totalPrice: Number(booking.totalPrice).toFixed(2),
          services: services.map((bs) => ({
            name: bs.service.name,
            price: `$${Number(bs.priceAtBooking).toFixed(2)}`,
          })),
          bookingUrl: `${frontendUrl}/customer/bookings/${booking.id}`,
        },
      });

      this.logger.log(`✅ Booking accepted email sent to ${customer.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to send booking accepted email', error);
      throw error;
    }
  }

  /**
   * Send booking rejected notification to customer
   */
  async sendBookingRejectedNotification(booking: Booking): Promise<void> {
    try {
      const customer = booking.customer;
      const salon = booking.salon;
      const services = booking.bookingServices;

      const frontendUrl = this.configService.get('email.frontendUrl');

      await this.mailerService.sendMail({
        to: customer.email,
        subject: `Booking Request Declined - ${salon.name}`,
        template: 'booking-rejected',
        context: {
          customerFirstName: customer.firstName,
          salonName: salon.name,
          preferredTime: this.formatDate(booking.preferredTime),
          totalPrice: Number(booking.totalPrice).toFixed(2),
          rejectionReason:
            booking.rejectionReason || 'The salon cannot accommodate your request.',
          services: services.map((bs) => ({ name: bs.service.name })),
          bookingUrl: `${frontendUrl}/customer/bookings/${booking.id}`,
        },
      });

      this.logger.log(`✅ Booking rejected email sent to ${customer.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to send booking rejected email', error);
      throw error;
    }
  }

  /**
   * Send booking started notification to customer
   */
  async sendBookingStartedNotification(booking: Booking): Promise<void> {
    try {
      const customer = booking.customer;
      const salon = booking.salon;

      const completionTime = new Date(
        new Date().getTime() + booking.totalDurationMinutes * 60000,
      );

      await this.mailerService.sendMail({
        to: customer.email,
        subject: `Your Service Has Started - ${salon.name}`,
        template: 'booking-started',
        context: {
          customerFirstName: customer.firstName,
          salonName: salon.name,
          estimatedCompletionTime: this.formatDate(completionTime),
        },
      });

      this.logger.log(`✅ Booking started email sent to ${customer.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to send booking started email', error);
      throw error;
    }
  }

  /**
   * Send booking completed notification to customer
   */
  async sendBookingCompletedNotification(booking: Booking): Promise<void> {
    try {
      const customer = booking.customer;
      const salon = booking.salon;

      const frontendUrl = this.configService.get('email.frontendUrl');

      await this.mailerService.sendMail({
        to: customer.email,
        subject: `Service Complete - ${salon.name}`,
        template: 'booking-completed',
        context: {
          customerFirstName: customer.firstName,
          salonName: salon.name,
          bookingUrl: `${frontendUrl}/customer/bookings/${booking.id}`,
        },
      });

      this.logger.log(`✅ Booking completed email sent to ${customer.email}`);
    } catch (error) {
      this.logger.error('❌ Failed to send booking completed email', error);
      throw error;
    }
  }

  /**
   * Helper: Format date for display
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    };
    return new Date(date).toLocaleDateString('en-US', options);
  }
}
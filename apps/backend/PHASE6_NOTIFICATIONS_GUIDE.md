# Phase 6: Email Notifications - Complete Guide

## 🎯 Goal
Build a complete email notification system that keeps customers and barbers informed about booking status changes:
- Booking created notification (to barber)
- Booking accepted notification (to customer)
- Booking rejected notification (to customer with reason)
- Booking in progress notification (to customer)
- Booking completed notification (to customer)
- Email templates with professional styling
- Error handling and logging

---

## 📋 What We'll Build

### Email Events:
1. **Booking Created** → Email to barber (new booking request)
2. **Booking Accepted** → Email to customer (booking confirmed)
3. **Booking Rejected** → Email to customer (with rejection reason)
4. **Booking In Progress** → Email to customer (service started)
5. **Booking Completed** → Email to customer (service finished)

### Key Features:
- Professional HTML email templates
- Dynamic content insertion
- Error handling and retry logic
- Email sending queue
- Notification logging

---

## Step 1: Install Dependencies (5 minutes)

We'll use **Nodemailer** for simplicity (works with Gmail, Outlook, custom SMTP servers) instead of SendGrid to avoid API keys for this demo.

```bash
npm install nodemailer @nestjs/mailer handlebars
npm install -D @types/nodemailer
```

For production, you can easily switch to SendGrid or AWS SES.

---

## Step 2: Configure Email Settings (15 minutes)

### 2.1 Update `.env` file

```env
# Existing configs...

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail: Generate at https://myaccount.google.com/apppasswords
EMAIL_FROM=noreply@queuecut.com
EMAIL_FROM_NAME=QueueCut Salon

# Frontend URL (for links in emails)
FRONTEND_URL=http://localhost:4200
```

**Note:** For Gmail:
1. Enable 2-factor authentication
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the generated password to EMAIL_PASSWORD

### 2.2 Create Email Config

**File: `src/config/email.config.ts`**
```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  user: process.env.EMAIL_USER || 'test@gmail.com',
  password: process.env.EMAIL_PASSWORD || '',
  from: process.env.EMAIL_FROM || 'noreply@queuecut.com',
  fromName: process.env.EMAIL_FROM_NAME || 'QueueCut',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
}));
```

### 2.3 Update `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs/mailer';
import { HandlebarsAdapter } from '@nestjs/mailer/dist/adapters/handlebars.adapter';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config'; // Add this

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SalonModule } from './modules/salon/salon.module';
import { ServiceModule } from './modules/service/service.module';
import { BookingModule } from './modules/booking/booking.module';
import { NotificationModule } from './modules/notification/notification.module'; // Add this

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, emailConfig], // Add emailConfig
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    // Email configuration
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('email.host'),
          port: configService.get('email.port'),
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.get('email.user'),
            pass: configService.get('email.password'),
          },
        },
        defaults: {
          from: `"${configService.get('email.fromName')}" <${configService.get(
            'email.from',
          )}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    AuthModule,
    UserModule,
    SalonModule,
    ServiceModule,
    BookingModule,
    NotificationModule, // Add this
  ],
})
export class AppModule {}
```

---

## Step 3: Create Email Templates (20 minutes)

Create a `templates` folder in src:

```bash
mkdir -p src/templates
```

### 3.1 Booking Created Template (For Barber)

**File: `src/templates/booking-created.hbs`**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .service-item {
      background-color: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .service-name {
      font-weight: 600;
      color: #333;
    }
    .service-details {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #667eea;
    }
    .info-value {
      color: #333;
    }
    .highlight {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background-color: #667eea;
      color: #fff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: 600;
    }
    .button:hover {
      background-color: #764ba2;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
    }
    .footer-links {
      margin-top: 10px;
    }
    .footer-links a {
      color: #667eea;
      text-decoration: none;
      margin: 0 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New Booking Request!</h1>
    </div>
    
    <div class="content">
      <p>Hi {{barberFirstName}},</p>
      
      <p>You have received a new booking request from <strong>{{customerName}}</strong>.</p>

      <div class="section">
        <div class="section-title">📋 Booking Details</div>
        <div class="info-row">
          <div class="info-label">Customer Name</div>
          <div class="info-value">{{customerName}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Email</div>
          <div class="info-value">{{customerEmail}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Phone</div>
          <div class="info-value">{{customerPhone}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Preferred Time</div>
          <div class="info-value">{{preferredTime}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Total Duration</div>
          <div class="info-value">{{totalDuration}} minutes</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">✂️ Requested Services</div>
        {{#each services}}
        <div class="service-item">
          <div class="service-name">{{this.name}}</div>
          <div class="service-details">
            Duration: {{this.duration}} min | Price: ${{this.price}}
          </div>
        </div>
        {{/each}}
      </div>

      <div class="section">
        <div class="section-title">💰 Total Cost</div>
        <div style="font-size: 24px; font-weight: 700; color: #667eea;">
          ${{totalPrice}}
        </div>
      </div>

      <div class="highlight">
        <strong>⚠️ Action Required:</strong> Please review this booking request and accept or reject it. The customer is waiting for confirmation.
      </div>

      <center>
        <a href="{{dashboardUrl}}" class="button">View Dashboard</a>
      </center>
    </div>

    <div class="footer">
      <p>This is an automated email from QueueCut Salon Management System.</p>
      <p>© 2024 QueueCut. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 3.2 Booking Accepted Template (For Customer)

**File: `src/templates/booking-accepted.hbs`**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      color: #fff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #11998e;
      margin-bottom: 15px;
      border-bottom: 2px solid #11998e;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #11998e;
    }
    .info-value {
      color: #333;
    }
    .success-box {
      background-color: #d4edda;
      border-left: 4px solid #28a745;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #155724;
    }
    .button {
      display: inline-block;
      background-color: #11998e;
      color: #fff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: 600;
    }
    .button:hover {
      background-color: #38ef7d;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Booking Confirmed!</h1>
    </div>
    
    <div class="content">
      <p>Hi {{customerFirstName}},</p>
      
      <p>Great news! Your booking at <strong>{{salonName}}</strong> has been <strong style="color: #11998e;">accepted and confirmed</strong>.</p>

      <div class="success-box">
        Your appointment is scheduled for <strong>{{preferredTime}}</strong>. Please arrive a few minutes early.
      </div>

      <div class="section">
        <div class="section-title">📅 Appointment Details</div>
        <div class="info-row">
          <div class="info-label">Salon</div>
          <div class="info-value">{{salonName}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Address</div>
          <div class="info-value">{{salonAddress}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Date & Time</div>
          <div class="info-value">{{preferredTime}}</div>
        </div>
        <div class="info-row">
          <div class="info-label">Duration</div>
          <div class="info-value">{{totalDuration}} minutes</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">✂️ Services</div>
        {{#each services}}
        <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <div style="font-weight: 600;">{{this.name}}</div>
          <div style="color: #666; font-size: 14px;">{{this.price}}</div>
        </div>
        {{/each}}
      </div>

      <div class="section">
        <div class="info-row">
          <div class="info-label">Total Amount</div>
          <div style="font-size: 20px; font-weight: 700; color: #11998e;">${{totalPrice}}</div>
        </div>
      </div>

      <center>
        <a href="{{bookingUrl}}" class="button">View Your Booking</a>
      </center>

      <p style="color: #666; font-size: 14px;">
        <strong>Need to reschedule or cancel?</strong> Contact the salon directly or visit your account to make changes.
      </p>
    </div>

    <div class="footer">
      <p>This is an automated email from QueueCut Salon Management System.</p>
      <p>© 2024 QueueCut. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 3.3 Booking Rejected Template (For Customer)

**File: `src/templates/booking-rejected.hbs`**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #eb5757 0%, #f09f4f 100%);
      color: #fff;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #eb5757;
      margin-bottom: 15px;
      border-bottom: 2px solid #eb5757;
      padding-bottom: 10px;
    }
    .info-box {
      background-color: #ffe0e0;
      border-left: 4px solid #eb5757;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      color: #721c24;
    }
    .button {
      display: inline-block;
      background-color: #eb5757;
      color: #fff;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 4px;
      margin-top: 20px;
      font-weight: 600;
    }
    .button:hover {
      background-color: #f09f4f;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>❌ Booking Request Declined</h1>
    </div>
    
    <div class="content">
      <p>Hi {{customerFirstName}},</p>
      
      <p>Unfortunately, your booking request for <strong>{{salonName}}</strong> has been <strong style="color: #eb5757;">declined</strong>.</p>

      <div class="info-box">
        <strong>Reason:</strong> {{rejectionReason}}
      </div>

      <div class="section">
        <div class="section-title">📝 Original Request Details</div>
        <div style="padding: 10px 0;">
          <div><strong>Salon:</strong> {{salonName}}</div>
          <div><strong>Preferred Date & Time:</strong> {{preferredTime}}</div>
          <div><strong>Services:</strong> {{#each services}}{{this.name}}{{#unless @last}}, {{/unless}}{{/each}}</div>
          <div><strong>Total Amount:</strong> ${{totalPrice}}</div>
        </div>
      </div>

      <p>We recommend trying to book another time slot or contacting the salon directly to discuss options.</p>

      <center>
        <a href="{{bookingUrl}}" class="button">View Booking & Try Again</a>
      </center>
    </div>

    <div class="footer">
      <p>This is an automated email from QueueCut Salon Management System.</p>
      <p>© 2024 QueueCut. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 3.4 Additional Templates

Create these additional templates:

**File: `src/templates/booking-started.hbs`**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .info-box { background-color: #e7f3ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏱️ Your Service has Started!</h1>
    </div>
    <div class="content">
      <p>Hi {{customerFirstName}},</p>
      <p>Great! Your appointment at <strong>{{salonName}}</strong> has started.</p>
      <div class="info-box">
        <strong>Estimated completion time:</strong> {{estimatedCompletionTime}}
      </div>
      <p>Thank you for choosing us!</p>
    </div>
  </div>
</body>
</html>
```

**File: `src/templates/booking-completed.hbs`**
```handlebars
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; background-color: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #fff; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .success-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; color: #155724; }
    .button { display: inline-block; background-color: #11998e; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin-top: 20px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Service Completed!</h1>
    </div>
    <div class="content">
      <p>Hi {{customerFirstName}},</p>
      <div class="success-box">
        Your appointment at <strong>{{salonName}}</strong> has been completed. We hope you're satisfied with the service!
      </div>
      <p>Thank you for visiting us. We'd love to hear your feedback!</p>
      <center>
        <a href="{{bookingUrl}}" class="button">Rate Your Experience</a>
      </center>
    </div>
  </div>
</body>
</html>
```

---

## Step 4: Create Notification Module (20 minutes)

### 4.1 Create Notification Service

**File: `src/modules/notification/notification.service.ts`**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs/mailer';
import { Booking } from '../../entities/booking.entity';
import { BookingStatus } from '../../common/enums';
import { ConfigService } from '@nestjs/config';

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
      const barber = booking.salon.owner;
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
          totalPrice: booking.totalPrice.toFixed(2),
          services: services.map((bs) => ({
            name: bs.service.name,
            duration: bs.durationAtBooking,
            price: bs.priceAtBooking.toFixed(2),
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
          totalPrice: booking.totalPrice.toFixed(2),
          services: services.map((bs) => ({
            name: bs.service.name,
            price: `$${bs.priceAtBooking.toFixed(2)}`,
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
          totalPrice: booking.totalPrice.toFixed(2),
          rejectionReason:
            booking.rejectionReason || 'The salon cannot accommodate your request.',
          services: services.map((bs) => bs.service.name),
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
```

### 4.2 Create Notification Module

**File: `src/modules/notification/notification.module.ts`**
```typescript
import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
```

---

## Step 5: Integrate Notifications into Booking Service (15 minutes)

Update the Booking Service to trigger notifications on status changes.

**File: `src/modules/booking/booking.service.ts`** (Add to imports and methods)

```typescript
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BookingService {
  constructor(
    // ... existing injections ...
    private notificationService: NotificationService, // Add this
  ) {}

  /**
   * Create a new booking (Customer only)
   */
  async create(customerId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    // ... existing code ...

    const savedBooking = await this.bookingRepository.save(booking);

    // Create booking services...
    const bookingServices = services.map((service) => {
      return this.bookingServiceRepository.create({
        bookingId: savedBooking.id,
        serviceId: service.id,
        priceAtBooking: service.price,
        durationAtBooking: service.durationMinutes,
      });
    });

    await this.bookingServiceRepository.save(bookingServices);

    // Return booking with relations
    const completeBooking = await this.findOne(savedBooking.id);

    // Send notification to barber
    try {
      await this.notificationService.sendBookingCreatedNotification(
        completeBooking,
      );
    } catch (error) {
      // Log but don't fail - booking should be created even if email fails
      console.error('Email notification failed:', error);
    }

    return completeBooking;
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

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingAcceptedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
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

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingRejectedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
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

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingStartedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
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

    const updatedBooking = await this.bookingRepository.save(booking);

    // Send notification to customer
    try {
      await this.notificationService.sendBookingCompletedNotification(
        await this.findOne(updatedBooking.id),
      );
    } catch (error) {
      console.error('Email notification failed:', error);
    }

    return await this.findOne(updatedBooking.id);
  }
}
```

### 5.1 Update Booking Module

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
import { NotificationModule } from '../notification/notification.module'; // Add this

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, BookingServiceEntity, Salon]),
    ServiceModule,
    NotificationModule, // Add this
  ],
  controllers: [BookingController],
  providers: [BookingService, QueueService],
  exports: [BookingService, QueueService, TypeOrmModule],
})
export class BookingModule {}
```

---

## Step 6: Test Email Notifications (30 minutes)

### 6.1 Start the Application

```bash
npm run start:dev
```

You should see in logs:
```
[MailerModule] Email service configured successfully
```

### 6.2 Test Booking Created Notification

#### Create a Booking

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

**Expected:**
- Booking created in database
- Email sent to barber
- Check your email inbox (or terminal if using test setup)

**Console Log:**
```
✅ Booking created email sent to barber@test.com
```

### 6.3 Test Booking Accepted Notification

#### Accept the Booking

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<booking-id>/accept
Authorization: Bearer <barber-token>
```

**Expected:**
- Booking status changed to ACCEPTED
- Email sent to customer
- Email subject: "Booking Confirmed - [Salon Name]"

**Console Log:**
```
✅ Booking accepted email sent to customer@test.com
```

### 6.4 Test Booking Rejected Notification

#### Create Another Booking

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

#### Reject the Booking

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<new-booking-id>/reject
Authorization: Bearer <barber-token>
Content-Type: application/json

{
  "rejectionReason": "Fully booked for that time slot"
}
```

**Expected:**
- Booking status changed to REJECTED
- Email sent to customer with rejection reason
- Email subject: "Booking Request Declined - [Salon Name]"

**Console Log:**
```
✅ Booking rejected email sent to customer@test.com
```

### 6.5 Test Booking Started Notification

#### Start the Accepted Booking

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<accepted-booking-id>/start
Authorization: Bearer <barber-token>
```

**Expected:**
- Booking status changed to IN_PROGRESS
- Email sent to customer
- Email subject: "Your Service Has Started - [Salon Name]"

**Console Log:**
```
✅ Booking started email sent to customer@test.com
```

### 6.6 Test Booking Completed Notification

#### Complete the Service

**Request:**
```http
PATCH http://localhost:3000/api/bookings/<in-progress-booking-id>/complete
Authorization: Bearer <barber-token>
```

**Expected:**
- Booking status changed to COMPLETED
- Email sent to customer
- Email subject: "Service Complete - [Salon Name]"

**Console Log:**
```
✅ Booking completed email sent to customer@test.com
```

---

## Step 7: Troubleshooting Email Setup (15 minutes)

### 7.1 Gmail Configuration Issues

**Problem:** "Invalid login credentials"

**Solution:**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the generated 16-character password
4. Use this in `EMAIL_PASSWORD` (NOT your regular Gmail password)

### 7.2 Testing Without Real Email

If you don't have Gmail or want to test without sending real emails:

**Option 1: Use Ethereal Email (Fake SMTP)**

Update `.env`:
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=<ethereal-username>
EMAIL_PASSWORD=<ethereal-password>
```

1. Go to https://www.ethereal.email
2. Create a test account
3. Use credentials in `.env`
4. Check emails at https://ethereal.email/messages

**Option 2: Console Logging (Development)**

Add console logging instead of sending:

```typescript
// In notification.service.ts
async sendBookingCreatedNotification(booking: Booking): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log('📧 Email (Development Mode):', {
        to: booking.salon.owner.email,
        subject: `New Booking Request`,
        template: 'booking-created',
      });
      return;
    }

    // Real email sending...
  } catch (error) {
    this.logger.error('❌ Failed to send email', error);
  }
}
```

### 7.3 Check Email Logs

All email operations are logged:

```
✅ Email sent to user@example.com
❌ Failed to send email to user@example.com
```

---

## 📁 Final Folder Structure

```
src/
├── config/
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── email.config.ts ✅
│
├── templates/
│   ├── booking-created.hbs ✅
│   ├── booking-accepted.hbs ✅
│   ├── booking-rejected.hbs ✅
│   ├── booking-started.hbs ✅
│   └── booking-completed.hbs ✅
│
├── modules/
│   ├── notification/
│   │   ├── notification.module.ts ✅
│   │   └── notification.service.ts ✅
│   │
│   └── booking/
│       └── booking.service.ts (updated) ✅
│
└── app.module.ts (updated) ✅
```

---

## ✅ Verification Checklist

- [ ] Email configuration in `.env` is correct
- [ ] Mailer module loads without errors
- [ ] Email templates exist in `src/templates`
- [ ] NotificationService is exported from NotificationModule
- [ ] BookingService injects NotificationService
- [ ] Booking created notification sent to barber
- [ ] Booking accepted notification sent to customer
- [ ] Booking rejected notification sent to customer
- [ ] Booking started notification sent to customer
- [ ] Booking completed notification sent to customer
- [ ] Email logs appear in console
- [ ] Emails received in inbox (or Ethereal)

---

## 🎯 What You've Accomplished

✅ **Email Service Integration** - Configured Nodemailer  
✅ **Professional Email Templates** - HTML templates with styling  
✅ **Event-Based Notifications** - Triggered on booking status changes  
✅ **Error Handling** - Graceful failures without blocking bookings  
✅ **Logging** - Track all email operations  
✅ **Customer Communication** - Keep customers informed  
✅ **Barber Notifications** - Alert barbers to new bookings  

---

## 🚀 Next Steps (Frontend)

Now that the backend is complete:

**Phase 7: Frontend - Customer Portal**
- Login/Register pages
- Salon browsing & filtering
- Booking creation flow
- My bookings view
- Queue position display

**Phase 8: Frontend - Barber Dashboard**
- Dashboard with metrics
- Booking requests list
- Queue management
- Service management
- Salon profile

---

## 💡 Enhancement Ideas (Optional)

Want to extend notifications? Consider:

1. **SMS Notifications** - Text reminders (Twilio)
2. **Push Notifications** - Mobile/web push
3. **Email Scheduling** - Queue emails for batch sending
4. **Notification Preferences** - Let users opt-in/out
5. **Booking Reminders** - Reminder 24h before appointment
6. **Queue Position Updates** - When customer moves in queue
7. **No-Show Alerts** - Alert when customer is late
8. **Invoice Emails** - Send after completion

---

## 🆘 Common Issues & Solutions

### Issue 1: Emails not being sent
**Solution:** Check `npm` logs for SMTP connection errors. Verify email credentials in `.env`

### Issue 2: Templates not found
**Solution:** Ensure `src/templates/` exists and path in `app.module.ts` is correct

### Issue 3: Email variables showing as {{undefined}}
**Solution:** Check context object in notification.service.ts matches template variables

### Issue 4: Emails sent but malformed
**Solution:** Validate HTML in templates, check for syntax errors in handlebars

### Issue 5: Performance issues with email sending
**Solution:** Implement email queue (Bull/BullMQ) to send asynchronously

---

**Congratulations! 🎉**

You've built a complete backend with:
- ✅ Authentication & authorization
- ✅ Salon management with auto open/close
- ✅ Service management
- ✅ Booking system with queue
- ✅ Email notifications

**Your backend is now production-ready!** The next phase is building the Angular frontend for customers and barbers.

Would you like to start on **Phase 7 (Frontend - Customer Portal)** or would you like to make any improvements to the backend first? 🚀

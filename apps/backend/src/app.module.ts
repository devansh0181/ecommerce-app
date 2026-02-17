import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { SalonModule } from './modules/salon/salon.module';
import { ServiceModule } from './modules/service/service.module';
import { BookingModule } from './modules/booking/booking.module';
import { EntitiesModule } from './entities/entities.module';
import { AuthModule } from './modules/auth/auth.module';
import jwtConfig from './config/jwt.config';

/*
modules/user - User entity management
modules/salon - Salon + WorkingHours entities
modules/service - Service entity
modules/booking - Booking + BookingService entities
*/
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        ssl: configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),
    UserModule,
    SalonModule,
    ServiceModule,
    BookingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
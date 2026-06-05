import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { SalonService } from './services/salon.service';
import { ServiceService } from './services/service.service';
import { BookingService } from './services/booking.service';
import { QueueService } from './services/queue.service';

// Interceptors
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  providers: [
    AuthService,
    ApiService,
    SalonService,
    ServiceService,
    BookingService,
    QueueService,
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useValue: errorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}

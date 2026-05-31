# TASK 1: Create Folder Structure & Foundation Files

## 🎯 Objective
Create complete Angular project folder structure for QueueCut frontend.

## 📍 Current Location
You should be in: `apps/frontend/src/app/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create all folders and files exactly as specified below."
```

---

## ✅ TASK: Create Folder Structure

### Step 1: Create Core Directory Structure

Create these folders in `apps/frontend/src/app/`:

```
core/
  ├── models/
  ├── services/
  ├── guards/
  ├── interceptors/
  └── core.module.ts

shared/
  ├── components/
  ├── pipes/
  ├── directives/
  ├── services/
  └── shared.module.ts

features/
  ├── auth/
  │   ├── pages/
  │   │   ├── login/
  │   │   └── register/
  │   ├── auth.module.ts
  │   └── auth.routes.ts
  │
  ├── customer/
  │   ├── layouts/
  │   │   └── customer-layout/
  │   ├── pages/
  │   │   ├── home/
  │   │   ├── salons/
  │   │   │   ├── salon-list/
  │   │   │   └── salon-detail/
  │   │   ├── bookings/
  │   │   │   ├── my-bookings/
  │   │   │   ├── booking-detail/
  │   │   │   └── booking-confirmation/
  │   │   └── profile/
  │   ├── components/
  │   ├── customer.module.ts
  │   └── customer.routes.ts
  │
  └── barber/
      ├── layouts/
      │   └── barber-layout/
      ├── pages/
      │   ├── dashboard/
      │   ├── salon-profile/
      │   ├── bookings/
      │   │   ├── booking-requests/
      │   │   ├── booking-detail/
      │   │   └── queue-view/
      │   ├── services/
      │   │   ├── service-list/
      │   │   └── service-form/
      │   └── settings/
      ├── components/
      ├── barber.module.ts
      └── barber.routes.ts

styles/
  ├── _variables.scss
  ├── _typography.scss
  ├── _spacing.scss
  ├── _mixins.scss
  ├── _animations.scss
  ├── _responsive.scss
  ├── _global.scss
  ├── components/
  │   ├── buttons.scss
  │   ├── cards.scss
  │   ├── forms.scss
  │   ├── modals.scss
  │   ├── navigation.scss
  │   └── alerts.scss
  └── styles.scss

assets/
  ├── icons/
  ├── images/
  ├── animations/
  └── fonts/

environments/
  ├── environment.ts
  └── environment.prod.ts
```

---

## 📝 Create Initial Files

### 1. Core Module Files

**File: `src/app/core/models/user.model.ts`**
```typescript
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'BARBER';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'BARBER';
}
```

**File: `src/app/core/models/salon.model.ts`**
```typescript
export interface Salon {
  id: string;
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  isOpen: boolean;
  openedAt?: Date;
  closedAt?: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  services?: Service[];
  workingHours?: WorkingHours[];
}

export interface WorkingHours {
  id: string;
  salonId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  salonId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**File: `src/app/core/models/booking.model.ts`**
```typescript
export interface Booking {
  id: string;
  customerId: string;
  salonId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  preferredTime: Date;
  totalDurationMinutes: number;
  totalPrice: number;
  rejectionReason?: string;
  acceptedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  salon?: {
    id: string;
    name: string;
    address: string;
  };
  bookingServices?: BookingService[];
}

export interface BookingService {
  id: string;
  bookingId: string;
  serviceId: string;
  priceAtBooking: number;
  durationAtBooking: number;
  service?: {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
  };
}

export interface QueuePosition {
  bookingId: string;
  position: number;
  estimatedWaitTimeMinutes: number;
  bookingsAhead: number;
  status: string;
  message: string;
}
```

**File: `src/app/core/models/index.ts`**
```typescript
export * from './user.model';
export * from './salon.model';
export * from './booking.model';
```

---

### 2. Core Module Definition

**File: `src/app/core/core.module.ts`**
```typescript
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
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

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
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
  ],
})
export class CoreModule {}
```

---

### 3. Shared Module Definition

**File: `src/app/shared/shared.module.ts`**
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class SharedModule {}
```

---

### 4. Feature Module Templates

**File: `src/app/features/auth/auth.module.ts`**
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class AuthModule {}
```

**File: `src/app/features/customer/customer.module.ts`**
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class CustomerModule {}
```

**File: `src/app/features/barber/barber.module.ts`**
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
  ],
})
export class BarberModule {}
```

---

### 5. Environment Files

**File: `src/environments/environment.ts`**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

**File: `src/environments/environment.prod.ts`**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.queuecut.com/api',
};
```

---

### 6. Main Styles File

**File: `src/app/styles/styles.scss`**
```scss
// Import all SCSS modules
@import 'variables';
@import 'typography';
@import 'spacing';
@import 'mixins';
@import 'animations';
@import 'responsive';
@import 'global';

// Import component styles
@import 'components/buttons';
@import 'components/cards';
@import 'components/forms';
@import 'components/modals';
@import 'components/navigation';
@import 'components/alerts';
```

---

## ✅ Verification Checklist

After Copilot completes this task:

- [ ] All folders created
- [ ] Model files created with TypeScript interfaces
- [ ] Core module file created
- [ ] Shared module file created
- [ ] Feature module files created
- [ ] Environment files created
- [ ] Main styles file created
- [ ] Folder structure matches above

---

## 🚨 Important Notes

1. **Path Aliases:** You may need to configure these in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@assets/*": ["src/assets/*"],
      "@styles/*": ["src/app/styles/*"]
    }
  }
}
```

2. **Do NOT create service implementations yet** - Those come in Task 4

3. **All component folders are empty** - Components get created in Task 6-7

4. **Empty index.ts files** - They'll be populated later

---

## 🎯 Next Step

After this task completes successfully:
1. Run `ng serve` to verify no errors
2. Proceed to **TASK_2_SCSS_VARIABLES.md**

---

**Status: Ready for Copilot Agent Mode ✅**

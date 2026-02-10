# QueueCut - Salon Queue Management System

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Entity Relationship Design](#entity-relationship-design)
4. [API Module Breakdown](#api-module-breakdown)
5. [Development Roadmap](#development-roadmap)
6. [Folder Structure](#folder-structure)
7. [Key Business Rules](#key-business-rules)
8. [Resume Impact Highlights](#resume-impact-highlights)

---

## 1. Project Overview

### Vision
QueueCut is a digital queue management platform for salon/barber businesses. It eliminates physical waiting lines by providing customers with real-time queue visibility and booking management, while giving salon operators complete control over their schedule and customer flow.

### Problem Solved
- **For Customers:** No uncertainty about wait times; arrive just-in-time instead of early
- **For Salon Owners:** Better customer experience, improved scheduling efficiency, reduced no-shows with notifications
- **For Both:** Seamless digital ecosystem for service booking and queue transparency

### Key Differentiators
- Live queue position tracking with real-time waiting time calculations
- Flexible service selection with accurate duration aggregation
- Role-based system supporting two distinct user workflows
- Email notification pipeline for booking status updates
- Automatic open/close management with manual override capability

---

## 2. System Architecture

### 2.1 High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                   ANGULAR FRONTEND                      │
│  (Customer Portal & Barber Dashboard)                   │
└──────────────────┬──────────────────────────────────────┘
                   │ (REST API + WebSocket)
┌──────────────────▼──────────────────────────────────────┐
│                 NESTJS BACKEND                          │
│  (Auth, Business Logic, Queue Calculation, Notifications)
└──────────────────┬──────────────────────────────────────┘
                   │ (TypeORM)
┌──────────────────▼──────────────────────────────────────┐
│               POSTGRESQL DATABASE                       │
│  (Persistent Storage: Users, Salons, Bookings, etc.)    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Responsibility Boundaries

| Layer | Responsibility |
|-------|-----------------|
| **Frontend (Angular)** | User authentication, form validation, UI state, salon/service browsing, booking request submission, live queue position display, responsive design |
| **Backend (NestJS)** | User management, salon operations, booking workflow, queue logic, email notifications, business rule enforcement, database transactions |
| **Database (PostgreSQL)** | Persistent storage, relationship integrity, indexing for performance queries |

### 2.3 Authentication Flow
- JWT-based authentication
- Role-based access control (Customer vs. Barber)
- Secure password hashing
- Token refresh mechanism
- Session persistence

---

## 3. Entity Relationship Design

### 3.1 Core Entities

#### **User**
```
id (UUID, PK)
email (String, Unique)
password (Hashed)
role (Enum: CUSTOMER | BARBER)
firstName (String)
lastName (String)
phone (String)
createdAt (Timestamp)
updatedAt (Timestamp)
```
**Relations:**
- One-to-Many: User → Salon (Barber creates/owns salons)
- One-to-Many: User → Booking (Customer has bookings)

#### **Salon**
```
id (UUID, PK)
ownerId (UUID, FK)
name (String)
description (Text)
address (String)
latitude (Float)
longitude (Float)
rating (Float, 0-5)
isOpen (Boolean, current status)
openedAt (Timestamp)
closedAt (Timestamp)
createdAt (Timestamp)
updatedAt (Timestamp)
```
**Relations:**
- Many-to-One: Salon → User (belongs to barber)
- One-to-Many: Salon → WorkingHours
- One-to-Many: Salon → Service
- One-to-Many: Salon → Booking

#### **WorkingHours**
```
id (UUID, PK)
salonId (UUID, FK)
dayOfWeek (Enum: MON-SUN)
openTime (Time, HH:MM:SS)
closeTime (Time, HH:MM:SS)
isClosed (Boolean, salon closed on this day)
```
**Purpose:** Define recurring schedule; used to auto-open/close salons

#### **Service**
```
id (UUID, PK)
salonId (UUID, FK)
name (String)
description (Text)
price (Decimal)
durationMinutes (Integer)
isActive (Boolean, can be disabled)
createdAt (Timestamp)
updatedAt (Timestamp)
```
**Relations:**
- Many-to-One: Service → Salon
- Many-to-Many: Service ↔ Booking (via BookingService)

#### **BookingService** (Join Table)
```
id (UUID, PK)
bookingId (UUID, FK)
serviceId (UUID, FK)
priceAtBooking (Decimal, snapshot)
durationAtBooking (Integer, snapshot)
```
**Purpose:** Track exact service details at booking time; handles multiple services per booking

#### **Booking**
```
id (UUID, PK)
customerId (UUID, FK)
salonId (UUID, FK)
status (Enum: PENDING | ACCEPTED | REJECTED | IN_PROGRESS | COMPLETED)
preferredTime (Timestamp, customer's requested time)
totalDurationMinutes (Integer, sum of service durations)
totalPrice (Decimal, sum of service prices)
rejectionReason (String, nullable)
queuePosition (Integer, calculated field)
estimatedWaitTime (Integer, minutes, calculated)
createdAt (Timestamp)
acceptedAt (Timestamp, nullable)
completedAt (Timestamp, nullable)
updatedAt (Timestamp)
```
**Relations:**
- Many-to-One: Booking → User (Customer)
- Many-to-One: Booking → Salon
- One-to-Many: Booking → BookingService

#### **Queue** (Derived Entity)
**Not stored as separate table; calculated on-the-fly from Booking table**
```
Calculated as: SELECT * FROM Booking 
WHERE salonId = ? AND status = 'ACCEPTED' 
ORDER BY acceptedAt ASC
```
- Position = row number
- Wait time = sum of durations of all bookings ahead

### 3.2 ER Diagram (Text)
```
User (BARBER)
  ├─ 1:N → Salon
  │         ├─ 1:N → Service
  │         ├─ 1:N → WorkingHours
  │         └─ 1:N → Booking
  │
User (CUSTOMER)
  └─ 1:N → Booking
           ├─ N:M → Service (via BookingService)
           └─ N:1 → Salon
```

---

## 4. API Module Breakdown

### 4.1 Auth Module
**Responsibilities:** User registration, login, JWT management, role validation

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | None | Register new user (customer/barber) |
| `/api/auth/login` | POST | None | Login, return JWT token |
| `/api/auth/refresh` | POST | JWT | Refresh access token |
| `/api/auth/logout` | POST | JWT | Invalidate session |
| `/api/auth/me` | GET | JWT | Get current user profile |

### 4.2 Salon Module
**Responsibilities:** Salon CRUD, owner profile, open/close management, status

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/salons` | GET | None | List salons (with filters: location, rating, open status) |
| `/api/salons/:id` | GET | None | Get salon details + current queue count |
| `/api/salons` | POST | JWT(BARBER) | Create new salon |
| `/api/salons/:id` | PUT | JWT(BARBER) | Update salon details |
| `/api/salons/:id/toggle-status` | PATCH | JWT(BARBER) | Manually open/close salon |
| `/api/salons/:id/working-hours` | GET | None | Get salon working hours |
| `/api/salons/:id/working-hours` | PUT | JWT(BARBER) | Set working hours |

### 4.3 Service Module
**Responsibilities:** Service management (CRUD, pricing, duration)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/salons/:salonId/services` | GET | None | List services for salon |
| `/api/salons/:salonId/services` | POST | JWT(BARBER) | Create service |
| `/api/salons/:salonId/services/:id` | PUT | JWT(BARBER) | Update service |
| `/api/salons/:salonId/services/:id` | DELETE | JWT(BARBER) | Delete/disable service |
| `/api/salons/:salonId/services/:id/toggle` | PATCH | JWT(BARBER) | Enable/disable service |

### 4.4 Booking Module
**Responsibilities:** Booking request submission, status management, queue operations

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/bookings` | POST | JWT(CUSTOMER) | Create booking request (services array, preferred time) |
| `/api/bookings/:id` | GET | JWT | Get booking details |
| `/api/bookings/my-bookings` | GET | JWT(CUSTOMER) | Get customer's all bookings |
| `/api/salons/:salonId/bookings` | GET | JWT(BARBER) | Get salon's booking requests |
| `/api/bookings/:id/accept` | PATCH | JWT(BARBER) | Accept booking (moves to queue) |
| `/api/bookings/:id/reject` | PATCH | JWT(BARBER) | Reject booking (with optional reason) |
| `/api/bookings/:id/start` | PATCH | JWT(BARBER) | Mark booking as In Progress |
| `/api/bookings/:id/complete` | PATCH | JWT(BARBER) | Mark booking as Completed |

### 4.5 Queue Module
**Responsibilities:** Real-time queue position, waiting time calculation

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/salons/:salonId/queue` | GET | JWT(CUSTOMER) | Get current queue with positions |
| `/api/bookings/:id/queue-position` | GET | JWT(CUSTOMER) | Get booking's queue position & wait time |

**Queue Position Calculation:**
```
Position = 1 + (count of ACCEPTED bookings created before this one)
Wait Time = SUM(durationMinutes) of all bookings ahead
```

### 4.6 Notification Module (Internal, Non-API)
**Responsibilities:** Trigger email notifications based on booking events

| Event | Trigger | Recipients |
|-------|---------|------------|
| Booking Created | Customer submits request | Barber (notification) |
| Booking Accepted | Barber accepts | Customer (email confirmation) |
| Booking Rejected | Barber rejects | Customer (email with reason) |
| Queue Position Update | Real-time as queue changes | Customer (optional: WebSocket update) |

---

## 5. Development Roadmap

### Phase 1: Foundation (Week 1-2)
**Objective:** Set up infrastructure and core authentication

- [ ] Project setup: NestJS, Angular, PostgreSQL, TypeORM
- [ ] Database schema creation (User, Salon, Service tables)
- [ ] Auth module (JWT, register, login, role-based guards)
- [ ] User service and controller
- [ ] Basic error handling and logging

**Deliverable:** Authenticated API with user management

---

### Phase 2: Salon Management (Week 3)
**Objective:** Allow barbers to create and manage salons

- [ ] Salon entity, repository, service, controller
- [ ] WorkingHours entity and management
- [ ] Salon validation (ownership, uniqueness)
- [ ] Auto-open/close logic based on working hours (scheduled job)
- [ ] Manual open/close toggle endpoint
- [ ] Salon listing endpoint (with filters)

**Deliverable:** Barbers can create salons and manage hours/status

---

### Phase 3: Service Management (Week 4)
**Objective:** Allow barbers to define services with pricing and duration

- [ ] Service entity, repository, service, controller
- [ ] Service CRUD operations
- [ ] Service enable/disable logic
- [ ] Service list endpoint with salon filter
- [ ] Input validation (price > 0, duration > 0)

**Deliverable:** Barbers can define and manage services

---

### Phase 4: Booking System - Customer Flow (Week 5)
**Objective:** Allow customers to request bookings

- [ ] Booking and BookingService entities
- [ ] Booking creation endpoint (service selection, preferred time)
- [ ] Validation:
  - Salon must be open
  - Services must be active
  - Customer cannot have pending/accepted booking for same salon
- [ ] Booking status tracking (PENDING state)
- [ ] Customer can view their bookings

**Deliverable:** Customers can submit booking requests

---

### Phase 5: Queue Management - Barber Flow (Week 6)
**Objective:** Allow barbers to manage queue and process bookings

- [ ] Accept/reject booking endpoints
- [ ] Booking status transitions (PENDING → ACCEPTED → IN_PROGRESS → COMPLETED)
- [ ] Queue calculation service (position, wait time)
- [ ] Queue position endpoint
- [ ] Barber can view salon's current queue

**Deliverable:** Barbers can manage queue; customers see real queue position

---

### Phase 6: Notifications (Week 7)
**Objective:** Implement email notifications for booking events

- [ ] Email service integration (SendGrid / Nodemailer)
- [ ] Notification templates
- [ ] Trigger notifications on:
  - Booking accepted
  - Booking rejected (with reason)
  - Booking approaching (optional)
- [ ] Notification logging and error handling

**Deliverable:** Customers receive email updates on booking status

---

### Phase 7: Frontend - Customer Portal (Week 8-9)
**Objective:** Build Angular customer interface

- [ ] Login/register pages
- [ ] Salon browsing & filtering
- [ ] Salon detail page (services, queue count)
- [ ] Booking request form (multi-service selection)
- [ ] My Bookings page (status tracking)
- [ ] Queue position & live waiting time (real-time updates if WebSocket added)
- [ ] Responsive design

**Deliverable:** Fully functional customer-facing application

---

### Phase 8: Frontend - Barber Dashboard (Week 10-11)
**Objective:** Build Angular barber management interface

- [ ] Login page
- [ ] Salon profile management
- [ ] Working hours configuration
- [ ] Service management (CRUD UI)
- [ ] Open/close toggle
- [ ] Booking requests list
- [ ] Accept/reject booking UI
- [ ] Active queue display
- [ ] Booking status transitions (In Progress, Completed)
- [ ] Dashboard with key metrics (queue size, completed today, etc.)

**Deliverable:** Complete barber management dashboard

---

### Phase 9: Advanced Features & Optimization (Week 12)
**Objective:** Polish, optimize, and add nice-to-have features

- [ ] WebSocket integration for live queue updates (optional)
- [ ] Database indexing for performance (salonId, status, createdAt)
- [ ] Pagination for large datasets
- [ ] Salon ratings system
- [ ] Search and advanced filtering
- [ ] Error boundary improvements
- [ ] Unit and integration testing
- [ ] API documentation (Swagger)

**Deliverable:** Production-ready application

---

## 6. Folder Structure

### 6.1 NestJS Backend Structure

```
apps/backend/
├── src/
│   ├── main.ts                          # Entry point
│   ├── app.module.ts                    # Root module
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── common/
│   │   ├── decorators/                  # Custom decorators (e.g., @CurrentUser, @Roles)
│   │   ├── guards/                      # Auth guards, role guards
│   │   ├── interceptors/                # Response formatting, logging
│   │   ├── filters/                     # Exception filters
│   │   ├── pipes/                       # Validation pipes
│   │   └── constants.ts                 # App-wide constants
│   │
│   ├── config/
│   │   ├── database.config.ts           # TypeORM configuration
│   │   ├── jwt.config.ts                # JWT secret, expiration
│   │   ├── email.config.ts              # Email service config
│   │   └── env.validation.ts            # Environment validation
│   │
│   ├── database/
│   │   ├── migrations/                  # TypeORM migrations
│   │   └── seeds/                       # Database seeders (optional)
│   │
│   ├── entities/                        # TypeORM entities
│   │   ├── user.entity.ts
│   │   ├── salon.entity.ts
│   │   ├── service.entity.ts
│   │   ├── booking.entity.ts
│   │   ├── booking-service.entity.ts
│   │   ├── working-hours.entity.ts
│   │   └── index.ts                     # Export all entities
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/                     # Auth DTOs (LoginDto, RegisterDto)
│   │   │   ├── strategies/              # JWT strategy
│   │   │   └── auth.spec.ts
│   │   │
│   │   ├── user/
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── dto/                     # User DTOs
│   │   │   └── user.spec.ts
│   │   │
│   │   ├── salon/
│   │   │   ├── salon.module.ts
│   │   │   ├── salon.controller.ts
│   │   │   ├── salon.service.ts
│   │   │   ├── dto/                     # Salon DTOs
│   │   │   ├── salon.spec.ts
│   │   │   └── scheduled-tasks/         # Auto-open/close jobs
│   │   │
│   │   ├── service/
│   │   │   ├── service.module.ts
│   │   │   ├── service.controller.ts
│   │   │   ├── service.service.ts
│   │   │   ├── dto/                     # Service DTOs
│   │   │   └── service.spec.ts
│   │   │
│   │   ├── booking/
│   │   │   ├── booking.module.ts
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── dto/                     # Booking DTOs
│   │   │   └── booking.spec.ts
│   │   │
│   │   ├── queue/
│   │   │   ├── queue.module.ts
│   │   │   ├── queue.controller.ts
│   │   │   ├── queue.service.ts         # Queue logic (position, wait time)
│   │   │   ├── dto/
│   │   │   └── queue.spec.ts
│   │   │
│   │   └── notification/
│   │       ├── notification.module.ts
│   │       ├── notification.service.ts  # Email sending logic
│   │       └── templates/               # Email templates
│   │
│   └── utils/
│       ├── validators.ts                # Custom validators
│       └── helpers.ts                   # Helper functions
│
├── test/
│   └── app.e2e-spec.ts                  # E2E tests
│
├── .env                                 # Environment variables
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
└── README.md
```

### 6.2 Angular Frontend Structure

```
apps/frontend/
├── src/
│   ├── main.ts                          # App entry point
│   ├── main.server.ts                   # SSR entry point
│   ├── server.ts                        # Express server config
│   ├── styles.scss                      # Global styles
│   │
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts                # Routing configuration
│   │   ├── app.routes.server.ts         # SSR routing
│   │   ├── app.config.ts
│   │   ├── app.config.server.ts
│   │   │
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts      # Authentication logic
│   │   │   │   ├── api.service.ts       # HTTP client wrapper
│   │   │   │   ├── salon.service.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── queue.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   │
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts        # Route protection
│   │   │   │   └── role.guard.ts        # Role-based access
│   │   │   │
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts  # Add JWT to requests
│   │   │   │   └── error.interceptor.ts # Handle errors
│   │   │   │
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── salon.model.ts
│   │   │       ├── service.model.ts
│   │   │       ├── booking.model.ts
│   │   │       └── queue.model.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   ├── navbar/
│   │   │   │   └── loading-spinner/
│   │   │   │
│   │   │   ├── pipes/
│   │   │   │   ├── format-time.pipe.ts
│   │   │   │   └── format-price.pipe.ts
│   │   │   │
│   │   │   └── directives/
│   │   │       └── has-role.directive.ts
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   └── login.component.html
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       └── register.component.html
│   │   │   │
│   │   │   ├── customer/
│   │   │   │   ├── salon-list/
│   │   │   │   │   ├── salon-list.component.ts
│   │   │   │   │   └── salon-list.component.html
│   │   │   │   ├── salon-detail/
│   │   │   │   │   ├── salon-detail.component.ts
│   │   │   │   │   └── salon-detail.component.html
│   │   │   │   ├── booking-request/
│   │   │   │   │   ├── booking-request.component.ts
│   │   │   │   │   └── booking-request.component.html
│   │   │   │   ├── my-bookings/
│   │   │   │   │   ├── my-bookings.component.ts
│   │   │   │   │   └── my-bookings.component.html
│   │   │   │   └── queue-position/
│   │   │   │       ├── queue-position.component.ts
│   │   │   │       └── queue-position.component.html
│   │   │   │
│   │   │   └── barber/
│   │   │       ├── salon-profile/
│   │   │       │   ├── salon-profile.component.ts
│   │   │       │   └── salon-profile.component.html
│   │   │       ├── working-hours/
│   │   │       │   ├── working-hours.component.ts
│   │   │       │   └── working-hours.component.html
│   │   │       ├── service-management/
│   │   │       │   ├── service-management.component.ts
│   │   │       │   └── service-management.component.html
│   │   │       ├── booking-requests/
│   │   │       │   ├── booking-requests.component.ts
│   │   │       │   └── booking-requests.component.html
│   │   │       ├── queue-management/
│   │   │       │   ├── queue-management.component.ts
│   │   │       │   └── queue-management.component.html
│   │   │       └── dashboard/
│   │   │           ├── dashboard.component.ts
│   │   │           └── dashboard.component.html
│   │   │
│   │   └── layout/
│   │       ├── customer-layout/
│   │       │   ├── customer-layout.component.ts
│   │       │   └── customer-layout.component.html
│   │       └── barber-layout/
│   │           ├── barber-layout.component.ts
│   │           └── barber-layout.component.html
│   │
│   ├── assets/
│   │   ├── icons/
│   │   ├── images/
│   │   └── logos/
│   │
│   └── index.html
│
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
│
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── package.json
└── README.md
```

---

## 7. Key Business Rules

### 7.1 Booking Eligibility Rules
1. **Salon Must Be Open**
   - Check `Salon.isOpen` field
   - System auto-sets based on `WorkingHours` + current time
   - Barber can manually override

2. **Services Must Be Active**
   - All selected services must have `Service.isActive = true`
   - Disabled services cannot be added to booking

3. **No Duplicate Active Bookings**
   - Customer cannot have more than one PENDING or ACCEPTED booking for same salon simultaneously
   - COMPLETED bookings do not block new bookings
   - Allow multiple bookings for different salons

4. **Preferred Time Validation**
   - Must be in the future
   - Should ideally be within salon's open hours (warn if not)

### 7.2 Booking State Machine

```
PENDING
  ├─→ ACCEPTED (Barber accepts)
  │    ├─→ IN_PROGRESS (Barber starts service)
  │    │    └─→ COMPLETED (Barber finishes)
  │    └─→ REJECTED (Barber rejects)
  │
  └─→ REJECTED (Barber rejects directly from PENDING)
```

### 7.3 Queue Calculation Rules
- **Queue Position:** 1 + (count of other ACCEPTED bookings for same salon created before this one)
- **Wait Time Calculation:**
  ```
  WAIT_TIME = SUM(BookingService.durationAtBooking) 
              FOR all ACCEPTED bookings ahead in queue
  ```
- **Order:** Based on `Booking.acceptedAt` timestamp (FIFO within same salon)

### 7.4 Working Hours Auto-Open/Close
- **Daily Scheduled Job** (runs at minute boundary):
  - Fetch all salons
  - Check current time vs. WorkingHours for today
  - If within hours: Set `Salon.isOpen = true`
  - If outside hours: Set `Salon.isOpen = false`
  - **Exception:** If barber manually overrode status, respect override (add `manualOverride` flag if needed)

### 7.5 Service Duration Aggregation
- **Total Duration** = SUM of `Service.durationMinutes` for all services in booking
- Applied to booking creation
- Snapshot stored in `Booking.totalDurationMinutes` for consistency

### 7.6 Notification Rules
- **Booking Created:** Notify barber (in-app alert / email)
- **Booking Accepted:** Notify customer (email confirmation)
- **Booking Rejected:** Notify customer (email with `rejectionReason`)
- **Queue Position Updated:** Notify customer as queue changes (optional: WebSocket)

---

## 8. Resume Impact Highlights

### 8.1 Architecture & Design Patterns
✅ **Layered Architecture**
- Clean separation of concerns (Controller → Service → Repository)
- Demonstrates understanding of SOLID principles

✅ **Entity-Relationship Modeling**
- Complex domain modeling (many-to-many via join table, derived entities)
- Proper normalization for scalability

✅ **State Machine Implementation**
- Booking status transitions with business rule enforcement
- Shows understanding of stateful workflows

✅ **Real-Time Calculations**
- Queue position and waiting time derived on-the-fly (no denormalization)
- Optimized for correctness over premature optimization

### 8.2 Backend Sophistication
✅ **Business Logic Complexity**
- Booking eligibility rules (salon open, no duplicates, service active)
- Automated scheduling (auto-open/close based on working hours)
- Email notification pipeline triggered by domain events

✅ **Database Design**
- Proper indexing strategy (salonId, status, createdAt for queue queries)
- Transaction handling (booking acceptance atomicity)
- Foreign key constraints for data integrity

✅ **TypeORM Mastery**
- Custom repository methods (getQueueBySalonId, getCustomerActiveBooking)
- Query optimization (eager/lazy loading, joins)
- Migrations for schema versioning

✅ **NestJS Best Practices**
- Modular architecture (Auth, Salon, Booking modules)
- Decorators for cross-cutting concerns (@CurrentUser, @Roles)
- Middleware and interceptors for logging/error handling

### 8.3 Frontend Sophistication
✅ **Component Architecture**
- Feature-based folder structure (customer, barber, auth)
- Reusable shared components and directives
- Smart vs. presentational component separation

✅ **State Management**
- Services as state providers
- Observable-based reactive patterns

✅ **Role-Based UI**
- Different layouts and routes for customer vs. barber
- Role guards protecting sensitive features

✅ **Responsive Design**
- Mobile-first approach for salon browsing
- Dynamic queue updates

### 8.4 Full-Stack Competencies
✅ **Authentication & Security**
- JWT implementation
- Role-based access control (RBAC)
- Password hashing best practices

✅ **Data Persistence**
- Relational database design with TypeORM
- Migrations and versioning

✅ **API Design**
- RESTful conventions
- Consistent DTOs for request/response
- Proper HTTP status codes and error handling

✅ **DevOps Awareness**
- Environment configuration management
- Logging and monitoring hooks
- Deployment-ready structure (monorepo with multiple apps)

### 8.5 Problem-Solving & Real-World Thinking
✅ **Domain Complexity**
- Handles real salon operations (working hours, queue management)
- Booking state management with business constraints

✅ **Scalability Considerations**
- Efficient queue queries (indexed by salon, status, date)
- No in-memory queue state (persisted in DB)
- Can handle multiple salons and concurrent bookings

✅ **User Experience**
- Live queue visibility for customers
- Notification pipeline for transparency
- Barber dashboard for operational control

### 8.6 Interview Talking Points
1. **"Why bookings stored in DB, not separate queue table?"**
   - Answer: Single source of truth; easier to manage state transitions; queue derived on-the-fly is simpler than synchronizing two tables

2. **"How would you handle no-show bookings?"**
   - Answer: Add `isNoShow` flag or auto-expire after `acceptedAt + buffer time`

3. **"What if two barbers accept same booking simultaneously?"**
   - Answer: Database unique constraint on active bookings per customer per salon

4. **"How does auto-open/close scale?"**
   - Answer: Scheduled job with batch update; could optimize with indexed queries on dayOfWeek

5. **"Why multi-service per booking?"**
   - Answer: Customers want haircut + beard trim as single appointment; more flexible pricing

---

## Next Steps

1. **Phase 1 Setup:** Install dependencies, configure database, initialize NestJS + Angular projects
2. **Database Creation:** Run TypeORM migrations to create schema
3. **Start with Auth:** Implement JWT auth as foundation
4. **Iterative Development:** Follow roadmap phases in order
5. **Testing:** Add unit tests for business logic, E2E tests for critical flows
6. **Documentation:** API docs (Swagger), component stories (Storybook)

---

**Last Updated:** February 2026  
**Project Status:** Architecture Planning Complete  
**Ready for:** Phase 1 Implementation

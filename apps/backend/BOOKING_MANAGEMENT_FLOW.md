# 📚 Booking Management System - Complete End-to-End Flow Guide

**Document Version**: 1.0  
**Last Updated**: February 2024  
**System**: E-commerce Salon Booking Platform

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Design](#2-architecture--design)
3. [Database Schema](#3-database-schema)
4. [Complete API Flow](#4-complete-api-flow)
5. [Queue Management Deep Dive](#5-queue-management-deep-dive)
6. [State Machine & Transitions](#6-state-machine--transitions)
7. [Validation & Business Rules](#7-validation--business-rules)
8. [Error Handling](#8-error-handling)
9. [Role-Based Access Control](#9-role-based-access-control)
10. [Code-Wise Execution Flow](#10-code-wise-execution-flow)
11. [Real-World Scenarios](#11-real-world-scenarios)

---

## 1. System Overview

### What is the Booking Management System?

A complete **production-ready appointment booking platform** that allows:
- **Customers** to book multiple salon services
- **Barbers** to manage and accept/reject bookings
- **Real-time queue tracking** with estimated wait times
- **Immutable pricing** through service snapshots

### Key Features

| Feature | Purpose | Benefit |
|---------|---------|---------|
| **Multi-Service Booking** | Select 2+ services in one appointment | Flexibility for customers |
| **Queue Position Tracking** | See real-time position and wait time | Transparency |
| **Price Snapshots** | Lock prices at booking time | Prevent pricing disputes |
| **Status Workflow** | PENDING → ACCEPTED → COMPLETED | Clear lifecycle management |
| **Barber Control** | Accept/reject/manage appointments | Business efficiency |
| **Ownership Verification** | Only salon owner manages own salon | Security |

---

## 2. Architecture & Design

### System Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│  HTTP Client Layer (Frontend/Mobile)                 │
│  - Sends requests with JWT tokens                   │
│  - Receives JSON responses                          │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Controller Layer (HTTP Entry Points)                │
│  ✓ BookingController                                │
│    - POST /api/bookings                            │
│    - GET /api/bookings/my-bookings                 │
│    - PATCH /api/bookings/:id/accept                │
│  ✓ SalonBookingController                          │
│    - GET /api/salons/:salonId/bookings             │
│    - GET /api/salons/:salonId/queue                │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Service Layer (Business Logic)                      │
│  ✓ BookingService                                   │
│    - Validation                                    │
│    - State transitions                            │
│    - Business rules enforcement                   │
│  ✓ QueueService                                    │
│    - Queue position calculation                   │
│    - Wait time estimation                         │
│  ✓ ServiceService (dependency)                     │
│    - Service retrieval and validation             │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Repository Layer (Data Access)                      │
│  TypeORM Repositories (auto-generated)               │
│  - bookingRepository                               │
│  - bookingServiceRepository                        │
│  - salonRepository                                 │
│  - serviceRepository                               │
│  - userRepository                                  │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Database Layer (PostgreSQL/Supabase)                │
│  - bookings table                                  │
│  - booking_services table (join)                   │
│  - salons table                                    │
│  - services table                                  │
│  - users table                                     │
└─────────────────────────────────────────────────────┘
```

### Cross-Cutting Concerns

```
All Endpoints
     │
     ├─→ JwtAuthGuard
     │   └─ Validates token
     │   └─ Attaches user to request
     │   └─ Throws 401 if invalid
     │
     ├─→ RolesGuard (if decorated)
     │   └─ Checks user.role against @Roles()
     │   └─ Throws 403 if unauthorized
     │
     └─→ CurrentUser Decorator
         └─ Injects user object into method params
         └─ Type-safe user access
```

---

## 3. Database Schema

### Entity Relationship Diagram

```
┌──────────────┐
│    Users     │
│  (PK: id)    │
│  role enum   │
│  firstName   │
│  lastName    │
│  email       │
│  phone       │
└────┬─────────┘
     │
     ├────────────────┐ ownerId (1:N)
     │                │
     │                ▼
     │        ┌────────────────┐
     │        │   Salons       │
     │        │  (PK: id)      │
     │        │  ownerId FK    │
     │        │  isOpen bool   │
     │        │  address       │
     │        └────┬───────────┘
     │             │
     │      salonId (1:N)
     │             │
     │             ▼
     │      ┌────────────────┐
     │      │  Services      │
     │      │  (PK: id)      │
     │      │  salonId FK    │
     │      │  price         │
     │      │  duration      │
     │      │  isActive      │
     │      └────────────────┘
     │
     ├──────────────┐ customerId (1:N)
     │              │
     │              ▼
     │      ┌────────────────┐
     │      │   Bookings     │ ◄─── CORE ENTITY
     │      │  (PK: id)      │
     │      │  customerId FK │
     │      │  salonId FK    │
     │      │  status enum   │
     │      │  totalPrice    │
     │      │  totalDuration │
     │      │  acceptedAt    │
     │      │  completedAt   │
     │      └────┬───────────┘
     │           │
     │      bookingId (1:N)
     │      with snapshots
     │           │
     │           ▼
     │      ┌──────────────────────────┐
     │      │ BookingServices (JOIN)   │
     │      │  (PK: id)                │
     │      │  bookingId FK            │
     │      │  serviceId FK            │
     │      │  priceAtBooking ◄── SNAPSHOT
     │      │  durationAtBooking ◄──── SNAPSHOT
     │      └─────┬────────────────────┘
     │            │
     │      serviceId (N:1)
     │            │
     └────────────┘
(references back to Services)
```

### Detailed Entity Fields

#### **Bookings Table**

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  customerId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salonId UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  
  -- Status Workflow
  status VARCHAR NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED')),
  
  -- Booking Details
  preferredTime TIMESTAMP WITH TIME ZONE NOT NULL,
  totalPrice DECIMAL(10, 2) NOT NULL,
  totalDurationMinutes INTEGER NOT NULL,
  rejectionReason VARCHAR NULL,
  
  -- Timestamps
  acceptedAt TIMESTAMP WITH TIME ZONE NULL,
  completedAt TIMESTAMP WITH TIME ZONE NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_bookings_customer ON customerId,
  INDEX idx_bookings_salon ON salonId,
  INDEX idx_bookings_status ON status,
  INDEX idx_bookings_accepted_time ON acceptedAt
);
```

**Key Fields Explained**:
- `status`: Tracks booking lifecycle (see state machine)
- `preferredTime`: Customer's desired appointment time
- `totalPrice`: Sum of all service prices (immutable)
- `totalDurationMinutes`: Sum of all service durations (immutable)
- `acceptedAt`: When barber accepted the booking (triggers queue entry)
- `completedAt`: When service finished (end state)

#### **BookingServices Table (Join Table with Snapshots)**

```sql
CREATE TABLE booking_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  bookingId UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  serviceId UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  
  -- Snapshots (preserve state at booking time)
  priceAtBooking DECIMAL(10, 2) NOT NULL,
  durationAtBooking INTEGER NOT NULL,
  
  -- Metadata
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: prevent duplicate services in same booking
  UNIQUE(bookingId, serviceId),
  
  -- Indexes
  INDEX idx_booking_services_booking ON bookingId,
  INDEX idx_booking_services_service ON serviceId
);
```

**Why Snapshots Matter**:
```
Scenario: Customer books haircut on Feb 15 at price $25
         Barber changes price to $30 on Feb 16

Without snapshots:
  - Customer sees $30 in invoice (expects $25) ❌ CONFLICT

With snapshots:
  - Customer's record shows $25 (locked at booking time) ✓ IMMUTABLE
  - Invoice matches agreement ✓ CORRECT
  - Current service shows $30 (future bookings use new price) ✓ UPDATED
```

---

## 4. Complete API Flow

### 4.1 Customer Creates Booking

#### **HTTP Request**
```http
POST http://localhost:3000/api/bookings
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "salonId": "550e8400-e29b-41d4-a716-446655440000",
  "serviceIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440002"
  ],
  "preferredTime": "2024-02-20T14:00:00.000Z"
}
```

#### **Code Execution Path**

**Step 1: HTTP Entry Point** - BookingController
```
File: src/modules/booking/booking.controller.ts

@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
async create(
  @CurrentUser() user: User,  // Extracted from JWT
  @Body() createBookingDto: CreateBookingDto,  // Validated by class-validator
) {
  return this.bookingService.create(user.id, createBookingDto);
}
```

**What happens**:
1. JWT extracted from header
2. JwtAuthGuard validates token signature
3. RolesGuard checks `user.role === 'CUSTOMER'`
4. @CurrentUser() injects User object
5. DTO validation runs (@IsUUID, @ArrayMinSize, @IsDateString)
6. Call service with validated data

**Step 2: Business Logic** - BookingService.create()

```
File: src/modules/booking/booking.service.ts

Key Steps Executed:

1. verifySalonOpen(salonId)
   - Query: SELECT * FROM salons WHERE id = :salonId
   - Check: salon && salon.isOpen === true
   - Error: 404 if not found, 400 if closed
   - ✓ Ensures salon is operational

2. checkNoActiveBooking(customerId, salonId)
   - Query: SELECT * FROM bookings 
            WHERE customerId = :customerId 
            AND salonId = :salonId 
            AND status IN ('PENDING', 'ACCEPTED', 'IN_PROGRESS')
   - Error: 400 if any found
   - ✓ Prevents double-booking

3. serviceService.getActiveServicesByIds(salonId, serviceIds)
   - Query: SELECT * FROM services 
            WHERE id IN :serviceIds 
            AND salonId = :salonId 
            AND isActive = true
   - Error: 400 if any service inactive or wrong salon
   - ✓ Validates all services are available

4. serviceService.calculateTotals(services)
   - totalPrice = services.reduce((sum, s) => sum + s.price, 0)
   - totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0)
   - ✓ Computes subscription totals

5. validatePreferredTime(preferredTime)
   - Check: new Date(preferredTime) > new Date()
   - Error: 400 if in past
   - ✓ Ensures future booking only

6. bookingRepository.create() & save()
   - INSERT INTO bookings (customerId, salonId, status, totalPrice, ...)
   - status: PENDING (initial state)
   - ✓ Creates booking record

7. Create BookingService snapshots (for each service)
   - INSERT INTO booking_services (bookingId, serviceId, priceAtBooking, durationAtBooking)
   - ✓ Locks prices at booking time

8. findOne(savedBooking.id) with relations
   - SELECT with JOINs: customer, salon, bookingServices.service
   - ✓ Returns full object for response
```

#### **HTTP Response (201 Created)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440099",
  "status": "PENDING",
  "preferredTime": "2024-02-20T14:00:00.000Z",
  "totalDurationMinutes": 50,
  "totalPrice": 40.00,
  "rejectionReason": null,
  "acceptedAt": null,
  "completedAt": null,
  "createdAt": "2024-02-15T10:00:00.000Z",
  "updatedAt": "2024-02-15T10:00:00.000Z",
  "customerId": "user-uuid-customer",
  "salonId": "550e8400-e29b-41d4-a716-446655440000",
  
  "customer": {
    "id": "user-uuid-customer",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  
  "salon": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Premium Cuts Salon",
    "address": "123 Main St, NY"
  },
  
  "bookingServices": [
    {
      "id": "bs-1",
      "bookingId": "550e8400-e29b-41d4-a716-446655440099",
      "serviceId": "660e8400-e29b-41d4-a716-446655440001",
      "priceAtBooking": 25.00,
      "durationAtBooking": 30,
      "service": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Classic Haircut",
        "description": "30-minute haircut with styling",
        "price": 25.00,
        "durationMinutes": 30,
        "isActive": true,
        "salonId": "550e8400-e29b-41d4-a716-446655440000"
      }
    },
    {
      "id": "bs-2",
      "bookingId": "550e8400-e29b-41d4-a716-446655440099",
      "serviceId": "660e8400-e29b-41d4-a716-446655440002",
      "priceAtBooking": 15.00,
      "durationAtBooking": 20,
      "service": {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "name": "Beard Trim & Shape",
        "description": "20-minute beard grooming",
        "price": 15.00,
        "durationMinutes": 20,
        "isActive": true,
        "salonId": "550e8400-e29b-41d4-a716-446655440000"
      }
    }
  ]
}
```

---

### 4.2 Barber Accepts Booking

#### **HTTP Request**
```http
PATCH http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440099/accept
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### **Code Execution**

**Step 1: Controller** - BookingController.accept()
```
File: src/modules/booking/booking.controller.ts

@Patch(':id/accept')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.BARBER)
async accept(@Param('id') id: string, @CurrentUser() user: User) {
  // id: "550e8400-e29b-41d4-a716-446655440099"
  // user.id: "user-uuid-barber"
  // user.role: "BARBER"
  return this.bookingService.acceptBooking(id, user.id);
}
```

**Step 2: Service** - BookingService.acceptBooking()
```
File: src/modules/booking/booking.service.ts

Key Operations:

1. findOne(id)
   - SELECT * FROM bookings WHERE id = :id
   - Throws 404 if not found
   - ✓ Booking must exist

2. verifySalonOwnership(booking.salonId, userId)
   - SELECT salon WHERE id = booking.salonId
   - Check: salon.ownerId === userId
   - Throws 403 if mismatch
   - ✓ Only owner can manage

3. Status validation
   - Check: booking.status === 'PENDING'
   - Throws 400 if not PENDING
   - ✓ Can only accept pending bookings

4. Update booking
   - UPDATE bookings SET 
       status = 'ACCEPTED', 
       acceptedAt = NOW(),
       updatedAt = NOW()
     WHERE id = :id
   - ✓ Booking enters queue now
```

#### **HTTP Response (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440099",
  "status": "ACCEPTED",
  "acceptedAt": "2024-02-15T10:05:32.123Z",
  "totalDurationMinutes": 50,
  "totalPrice": 40.00,
  ...
}
```

---

### 4.3 Customer Checks Queue Position

#### **HTTP Request**
```http
GET http://localhost:3000/api/bookings/550e8400-e29b-41d4-a716-446655440099/queue-position
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Code Execution**

**Step 1: Controller** - BookingController.getQueuePosition()
```
File: src/modules/booking/booking.controller.ts

@Get(':id/queue-position')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
async getQueuePosition(@Param('id') id: string) {
  return this.queueService.getQueuePosition(id);
}
```

**Step 2: Service** - QueueService.getQueuePosition()
```
File: src/modules/booking/queue.service.ts

Algorithm:

1. fetchBooking(bookingId)
   - SELECT * FROM bookings WHERE id = :id
   - Throws 404 if not found

2. statusCheck()
   - If status !== ACCEPTED
     └─ Return: position=0, waitTime=0, "pending approval..."
   - If status === ACCEPTED → Continue

3. queryBookingsAhead()
   - SELECT * FROM bookings
     WHERE salonId = :salonId
       AND status = 'ACCEPTED'
       AND acceptedAt < :currentBooking.acceptedAt
     ORDER BY acceptedAt ASC
   - Result: All bookings accepted before current one

4. calculatePosition()
   - position = bookingsAhead.length + 1
   - 1-indexed: if 1 booking ahead → position = 2

5. calculateWaitTime()
   - estimatedWait = SUM(booking.totalDurationMinutes)
   - For all bookings in bookingsAhead
   - Example: [30 min, 50 min] → total 80 minutes

6. buildResponse()
   - Return QueuePositionDto with all metrics
   - Include human-readable message
```

#### **HTTP Response (200 OK)**
```json
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440099",
  "position": 2,
  "bookingsAhead": 1,
  "estimatedWaitTimeMinutes": 30,
  "status": "ACCEPTED",
  "message": "You are #2 in queue. Estimated wait time: 30 minutes."
}
```

---

## 5. Queue Management Deep Dive

### Queue Mechanics

#### **Why Only ACCEPTED Bookings Are in Queue?**

```
Booking Status Lifecycle:

PENDING          │ Barber hasn't reviewed yet
  ├─ No queue position
  ├─ Customer waiting for approval
  └─ Not scheduled

ACCEPTED ✓       │ Barber approved, waiting to serve
  ├─ ENTERS QUEUE
  ├─ Has position and wait time
  └─ Ordered by acceptedAt timestamp

IN_PROGRESS      │ Barber currently serving
  ├─ Removed from queue
  ├─ Position = 0
  └─ Customer is being served

COMPLETED ✓      │ Service finished
  ├─ No longer in queue
  ├─ Final state
  └─ Invoice finalized

REJECTED         │ Barber declined
  ├─ No queue position
  ├─ Final state
  └─ Customer needs to rebook
```

### Queue Position Calculation Algorithm

#### **Example Scenario**

**Time 10:00** - Booking B1 Accepted
```
queueService.getQueuePosition('B1')

Query: WHERE acceptedAt < 10:00 AND status = 'ACCEPTED'
Result: [] (no bookings before)
bookingsAhead = 0
position = 0 + 1 = 1 ✓
estimatedWaitTime = 0
Response: "You are #1 in queue. Estimated wait time: 0 minutes."
```

**Time 10:05** - Booking B2 Accepted
```
// B2 acceptedAt = 10:05
queueService.getQueuePosition('B2')

Query: WHERE acceptedAt < 10:05 AND status = 'ACCEPTED'
Result: [B1 (acceptedAt: 10:00)]  
bookingsAhead = 1
position = 1 + 1 = 2 ✓
estimatedWaitTime = B1.totalDuration = 30 min
Response: "You are #2 in queue. Estimated wait time: 30 minutes."
```

**Time 10:10** - Booking B3 Accepted
```
// B3 acceptedAt = 10:10
queueService.getQueuePosition('B3')

Query: WHERE acceptedAt < 10:10 AND status = 'ACCEPTED'
Result: [B1 (10:00), B2 (10:05)]  
bookingsAhead = 2
position = 2 + 1 = 3 ✓
estimatedWaitTime = B1.duration(30) + B2.duration(50) = 80 min
Response: "You are #3 in queue. Estimated wait time: 80 minutes."
```

**Time 10:12** - Barber Starts B1
```
// B1 status changes from ACCEPTED to IN_PROGRESS
UPDATE bookings SET status = 'IN_PROGRESS' WHERE id = 'B1'

// Queue recalculates for B2:
queueService.getQueuePosition('B2')

Query: WHERE acceptedAt < B2.acceptedAt(10:05) AND status = 'ACCEPTED'
Result: []  // B1 no longer ACCEPTED
bookingsAhead = 0
position = 0 + 1 = 1 ✓  // B2 moves to front
estimatedWaitTime = 0
Response: "You are #1 in queue. Estimated wait time: 0 minutes."
```

### Real-Time Queue View

#### **GET /api/salons/:salonId/queue** (Public Endpoint)

```typescript
File: src/modules/salon/salon-booking.controller.ts

@Get('queue')
async getSalonQueue(@Param('salonId') salonId: string) {
  return this.queueService.getSalonQueue(salonId);
}

// Service implementation (QueueService):
async getSalonQueue(salonId: string): Promise<Booking[]> {
  return await this.bookingRepository.find({
    where: {
      salonId,
      status: BookingStatus.ACCEPTED,  // Only ACCEPTED bookings
    },
    relations: ['customer', 'bookingServices', 'bookingServices.service'],
    order: {
      acceptedAt: 'ASC',  // Chronological order
    },
  });
}
```

**Response Example**:
```json
[
  {
    "id": "B1",
    "status": "ACCEPTED",
    "acceptedAt": "2024-02-15T10:00:00Z",
    "totalDurationMinutes": 30,
    "customer": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  {
    "id": "B2",
    "status": "ACCEPTED",
    "acceptedAt": "2024-02-15T10:05:00Z",
    "totalDurationMinutes": 50,
    "customer": {
      "firstName": "Jane",
      "lastName": "Smith"
    }
  }
]
```

---

## 6. State Machine & Transitions

### Complete State Diagram

```
                        POST /api/bookings
                               │
                               ▼
                    ┌──────────────────┐
                    │    PENDING       │  ← Initial state
                    │  (Awaiting OK)   │
                    │  position: 0     │
                    └────────┬─────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
         BARBER     │                 │     BARBER
        calls       │                 │    calls  
      /accept       │                 │   /reject
                    │                 │
           ┌────────▼────────┐  ┌────▼──────────┐
           │   ACCEPTED      │  │  REJECTED     │
           │ (In queue now)  │  │(Terminal)     │
           │ position: N     │  │position: 0    │
           └────────┬────────┘  └───────────────┘
                    │
        BARBER      │
       calls        │
       /start       │
                    │
           ┌────────▼──────────────┐
           │  IN_PROGRESS          │
           │  (Currently serving)  │
           │  position: 0          │
           └────────┬──────────────┘
                    │
        BARBER      │
       calls        │
      /complete     │
                    │
           ┌────────▼──────────────┐
           │   COMPLETED           │
           │  (Terminal)           │
           │  position: 0          │
           └───────────────────────┘
```

### Transition Rules

| From | To | Method | Guard | Error Code |
|------|----|----|----|----|
| PENDING | ACCEPTED | PATCH /:id/accept | status === PENDING | 400 if not PENDING |
| PENDING | REJECTED | PATCH /:id/reject | status in {PENDING, ACCEPTED} | 400 if invalid |
| ACCEPTED | IN_PROGRESS | PATCH /:id/start | status === ACCEPTED | 400 if not ACCEPTED |
| ACCEPTED | REJECTED | PATCH /:id/reject | status in {PENDING, ACCEPTED} | 400 if invalid |
| IN_PROGRESS | COMPLETED | PATCH /:id/complete | status === IN_PROGRESS | 400 if not IN_PROGRESS |

### Invalid Transitions (400 Bad Request)

```
Attempted                    │ Error Message
─────────────────────────────┼──────────────────────────────────────
COMPLETED → /accept          │ "Only pending bookings can be accepted"
IN_PROGRESS → /reject        │ "Only pending or accepted bookings..."
PENDING → /complete          │ "Only in-progress bookings can be..."
ACCEPTED → /complete (skip)  │ "Only in-progress bookings can be..."
```

---

## 7. Validation & Business Rules

### Input Validation (DTO Layer)

#### **CreateBookingDto Validation**

```typescript
// File: src/modules/booking/dto/create-booking.dto.ts

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  salonId: string;
  // Checks:
  // ✓ Valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  // ✓ Not empty/null
  // Error: 400 "salonId must be a UUID"

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one service must be selected' })
  @IsUUID('4', { each: true })
  serviceIds: string[];
  // Checks:
  // ✓ Is array type
  // ✓ Array has minimum 1 element
  // ✓ Each element is valid UUID
  // Error: 400 "At least one service must be selected"

  @IsDateString()
  @IsNotEmpty()
  preferredTime: string;
  // Checks:
  // ✓ Valid ISO 8601 format (2024-02-20T14:00:00.000Z)
  // ✓ Not empty
  // Error: 400 "preferredTime must be a valid ISO 8601 date string"
}
```

### Business Logic Validation

#### **Validation Chain in BookingService.create()**

```
Level 1: Salon Existence & Status
  └─ Error 404: Salon not found
  └─ Error 400: Salon is currently closed

Level 2: Booking Duplication Check
  └─ Error 400: "You already have an active booking..."

Level 3: Service Availability
  └─ Error 400: "Some services are not available"

Level 4: Time Validation
  └─ Error 400: "Preferred time must be in the future"

Level 5: Create & Persist
  └─ No more validation checks
  └─ All data verified and safe
```

---

## 8. Error Handling

### HTTP Status Codes

```
Status │ Meaning             │ Booking Context
───────┼─────────────────────┼──────────────────────────────
200    │ OK                  │ GET, PATCH succeeded
201    │ Created             │ POST /bookings succeeded
400    │ Bad Request         │ Validation or business rule
401    │ Unauthorized        │ Missing/invalid JWT
403    │ Forbidden           │ No permission (wrong role/owner)
404    │ Not Found           │ Booking/Salon doesn't exist
500    │ Server Error        │ Unexpected error
```

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Salon is currently closed",
  "error": "Bad Request"
}
```

### Common Scenarios

#### **1. Salon Closed**
```
Request: POST /api/bookings { salonId: "closed-salon", ... }
Condition: salon.isOpen = false
Response 400: "Salon is currently closed"
```

#### **2. Duplicate Active Booking**
```
Existing: PENDING booking from John for Salon A
Request: POST /api/bookings { salonId: "salon-a", ... }
Response 400: "You already have an active booking..."
```

#### **3. Invalid Service**
```
Request: { serviceIds: ["inactive-service"] }
Condition: Service isActive = false
Response 400: "Some services are not available: <service-id>"
```

#### **4. Past Preferred Time**
```
Request: { preferredTime: "2020-01-01T00:00:00Z" }
Current: 2024-02-15T10:00:00Z
Response 400: "Preferred time must be in the future"
```

#### **5. Unauthorized Barber**
```
Request: PATCH /bookings/booking-123/accept
User: BarberB (owns Salon X)
Booking: Salon Y
Response 403: "You can only manage bookings for your own salon"
```

#### **6. Invalid State Transition**
```
Request: PATCH /bookings/booking-123/accept
Booking status: IN_PROGRESS
Response 400: "Only pending bookings can be accepted"
```

---

## 9. Role-Based Access Control

### Three-Layer Authorization

```
Layer 1: Authentication (JwtAuthGuard)
  └─ Is user logged in?
  └─ Is token valid?
  
Layer 2: Authorization (RolesGuard)
  └─ Does user have required role?
  └─ @Roles(CUSTOMER) or @Roles(BARBER)
  
Layer 3: Ownership (Service-level)
  └─ Does user own this resource?
  └─ salon.ownerId === user.id
```

### Endpoint Access Matrix

| Endpoint | Auth | Role | Ownership | Notes |
|----------|------|------|-----------|-------|
| POST /bookings | ✓ | CUSTOMER | N/A | Create bookings |
| GET /bookings/my-bookings | ✓ | CUSTOMER | N/A | Own bookings only |
| GET /bookings/:id | ✓ | ANY | N/A | View any booking |
| GET /bookings/:id/queue-pos | ✓ | CUSTOMER | N/A | Queue info |
| PATCH /:id/accept | ✓ | BARBER | ✓ salon | Accept in queue |
| PATCH /:id/reject | ✓ | BARBER | ✓ salon | Reject booking |
| PATCH /:id/start | ✓ | BARBER | ✓ salon | Begin service |
| PATCH /:id/complete | ✓ | BARBER | ✓ salon | Finish service |
| GET /salons/:salonId/bookings | ✓ | BARBER | ✓ salon | Salon bookings |
| GET /salons/:salonId/queue | ✗ | NONE | N/A | Public queue |

---

## 10. Code-Wise Execution Flow

### Complete Request-Response Cycle

#### **Customer Creates Booking (Detailed)**

```
1. CLIENT PREPARES REQUEST
   POST /api/bookings
   Authorization: Bearer <jwt-token>
   Content-Type: application/json
   Body: {
     "salonId": "550e8400...",
     "serviceIds": ["660e8400...", "660e8400..."],
     "preferredTime": "2024-02-20T14:00:00.000Z"
   }

2. SERVER RECEIVES
   Route matched: POST /api/bookings
   Guards initialized: JwtAuthGuard, RolesGuard

3. JWT AUTHENTICATION (JwtAuthGuard)
   ├─ Extract token from header
   ├─ Verify signature with secret
   ├─ Decode payload
   ├─ Attach user to request.user
   └─ Continue if valid, throw 401 if invalid

4. ROLE AUTHORIZATION (RolesGuard)
   ├─ Check request.user.role
   ├─ Compare against @Roles(UserRole.CUSTOMER)
   ├─ Continue if match
   └─ Throw 403 if no match

5. PARAMETER EXTRACTION
   ├─ @CurrentUser() → request.user
   └─ @Body() → raw JSON body

6. DTO VALIDATION (class-validator)
   ├─ Validate salonId: IsUUID, IsNotEmpty
   ├─ Validate serviceIds: IsArray, ArrayMinSize, IsUUID each
   ├─ Validate preferredTime: IsDateString
   ├─ If fails: return 400 with errors
   └─ If passes: continue

7. CONTROLLER HANDLER
   BookingController.create(user, createBookingDto)
   └─ Call bookingService.create(user.id, createBookingDto)

8. SERVICE BUSINESS LOGIC (BookingService)
   
   a) Verify Salon:
      SELECT * FROM salons WHERE id = :salonId
      ├─ Check: salon.isOpen = true
      └─ Throw 400 if closed, 404 if not found
   
   b) Check Active Booking:
      SELECT * FROM bookings WHERE customerId AND salonId AND status IN (...)
      └─ Throw 400 if found
   
   c) Get Services:
      SELECT * FROM services WHERE id IN AND isActive = true
      └─ Throw 400 if any unavailable
   
   d) Calculate Totals:
      totalPrice = SUM(service.price)
      totalDuration = SUM(service.duration)
   
   e) Validate Time:
      Check: preferredTime > now()
      └─ Throw 400 if past
   
   f) Create Booking:
      INSERT INTO bookings (...)
      └─ Returns booking with generated UUID
   
   g) Create Snapshots:
      INSERT INTO booking_services (...)
      For each service: save priceAtBooking, durationAtBooking
   
   h) Fetch Full Object:
      SELECT * WITH JOINS (customer, salon, services)

9. RESPONSE SERIALIZATION
   ├─ Convert to plain object
   ├─ Map to BookingResponseDto
   └─ Prepare JSON

10. HTTP RESPONSE
    Status: 201 Created
    Body: Full booking JSON
```

---

## 11. Real-World Scenarios

### Scenario 1: Multi-Customer Queue Formation

```
Timeline: 10:00 - 10:30

10:00 - Customer A Books at Salon X
  POST /bookings → bookingId: BK-A, status: PENDING

10:02 - Barber Accepts A
  PATCH /bookings/BK-A/accept
  └─ status: PENDING → ACCEPTED, acceptedAt: 10:02

10:05 - Customer B Books at Salon X  
  POST /bookings → bookingId: BK-B, status: PENDING

10:08 - Customer C Books at Salon X
  POST /bookings → bookingId: BK-C, status: PENDING

10:10 - Barber Accepts B
  PATCH /bookings/BK-B/accept
  └─ acceptedAt: 10:10
  └─ Queue: [BK-A (10:02), BK-B (10:10)]

10:15 - Barber Accepts C
  PATCH /bookings/BK-C/accept
  └─ acceptedAt: 10:15
  └─ Queue: [BK-A, BK-B, BK-C]

10:20 - Customer B Checks Position
  GET /bookings/BK-B/queue-position
  └─ Query: acceptedAt(10:10) < BK-B.acceptedAt
  └─ Results: [BK-A]
  └─ position: 2, wait: 30min

10:25 - Barber Starts A
  PATCH /bookings/BK-A/start
  └─ status: ACCEPTED → IN_PROGRESS
  └─ A removed from queue

10:26 - Customer B Checks Position (Now Front)
  GET /bookings/BK-B/queue-position
  └─ Query: acceptedAt < 10:10 AND status = ACCEPTED
  └─ Results: [] (A is IN_PROGRESS)
  └─ position: 1, wait: 0min

10:35 - Barber Completes A
  PATCH /bookings/BK-A/complete
  └─ status: IN_PROGRESS → COMPLETED
```

### Scenario 2: Ownership Violation

```
Barber Y tries to accept booking for Salon X (owned by Barber X):

PATCH /api/bookings/booking-123/accept
User: BarberY (id: barber-y-uuid)
Booking salonId: salon-x-uuid
Salon X owner: barber-x-uuid

Flow:
1. JwtAuthGuard validates ✓
2. RolesGuard checks BARBER ✓
3. acceptBooking() called
4. verifySalonOwnership()
   ├─ SELECT salon WHERE id = salon-x-uuid
   ├─ Check: salon.ownerId (barber-x-uuid) === user.id (barber-y-uuid)
   ├─ Result: FALSE
   └─ Throw ForbiddenException

Response 403:
"You can only manage bookings for your own salon"
Booking NOT updated
```

---

## Quick Reference: Common Operations

### Create Booking
```http
POST /api/bookings
```
**Key Validations**: Salon open, no duplicates, services active, future time

### Get My Bookings
```http
GET /api/bookings/my-bookings?status=ACCEPTED
```
**Filter Options**: PENDING, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED

### Check Queue Position
```http
GET /api/bookings/{id}/queue-position
```
**Returns**: Position number, estimated wait time

### Accept Booking
```http
PATCH /api/bookings/{id}/accept
```
**Auth**: BARBER role required, must own salon

### Reject Booking
```http
PATCH /api/bookings/{id}/reject
Body: { "rejectionReason": "..." }
```
**Auth**: BARBER role required

### Start Service
```http
PATCH /api/bookings/{id}/start
```
**Auth**: BARBER role required (moves from ACCEPTED to IN_PROGRESS)

### Complete Service
```http
PATCH /api/bookings/{id}/complete
```
**Auth**: BARBER role required (moves from IN_PROGRESS to COMPLETED)

### Get Salon Queue
```http
GET /api/salons/{salonId}/queue
```
**Public**: No authentication required (ordered by acceptedAt)

---

## Summary

✅ **Complete Workflow**: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED  
✅ **Multi-Service Bookings**: Multiple services with price snapshots  
✅ **Real-Time Queue**: Position calculated based on acceptedAt timestamp  
✅ **State Machine**: Clear transitions with validation  
✅ **Validation**: Input validation + Business logic validation  
✅ **RBAC**: Authentication + Authorization + Ownership checks  
✅ **Error Handling**: Meaningful status codes and messages  
✅ **Data Integrity**: Immutable price snapshots  

This system is **production-ready** with proper security, validation, and error handling!

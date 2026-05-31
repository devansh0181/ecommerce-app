# TASK 4: Core Services Implementation

## 🎯 Objective
Create all core services: AuthService, ApiService, SalonService, ServiceService, BookingService, QueueService.

## 📍 Location
Create files in: `apps/frontend/src/app/core/services/`

## 📋 Instructions for GitHub Copilot

**Copy this entire content and give to Copilot with:**
```
"Execute this task in agent mode. Create all 6 core service files with full implementations
including HTTP calls, state management with BehaviorSubject, and helper methods."
```

---

## 📝 FILE 1: auth.service.ts

**Path:** `src/app/core/services/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { environment } from '@environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getTokenFromStorage());
  token$ = this.tokenSubject.asObservable();

  isAuthenticated$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        this.setUser(response.user, response.accessToken);
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((response) => {
        this.setUser(response.user, response.accessToken);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  // ========================================
  // USER MANAGEMENT
  // ========================================

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  isCustomer(): boolean {
    return this.getCurrentUser()?.role === 'CUSTOMER';
  }

  isBarber(): boolean {
    return this.getCurrentUser()?.role === 'BARBER';
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.role === role;
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  private setUser(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('accessToken', token);
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('accessToken');
  }

  private loadUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}
```

---

## 📝 FILE 2: api.service.ts

**Path:** `src/app/core/services/api.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ========================================
  // GET METHODS
  // ========================================

  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params: httpParams });
  }

  // ========================================
  // POST METHODS
  // ========================================

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  // ========================================
  // PUT METHODS
  // ========================================

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  // ========================================
  // PATCH METHODS
  // ========================================

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}${endpoint}`, body);
  }

  // ========================================
  // DELETE METHODS
  // ========================================

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }
}
```

---

## 📝 FILE 3: salon.service.ts

**Path:** `src/app/core/services/salon.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Salon, WorkingHours, Service } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SalonService {
  private salonsSubject = new BehaviorSubject<Salon[]>([]);
  salons$ = this.salonsSubject.asObservable();

  private selectedSalonSubject = new BehaviorSubject<Salon | null>(null);
  selectedSalon$ = this.selectedSalonSubject.asObservable();

  constructor(private api: ApiService) {}

  // ========================================
  // SALON CRUD
  // ========================================

  getSalons(params?: any): Observable<{ data: Salon[]; total: number }> {
    return this.api.get<{ data: Salon[]; total: number }>('/salons', params).pipe(
      tap((response) => {
        this.salonsSubject.next(response.data);
      })
    );
  }

  getSalonById(id: string): Observable<Salon> {
    return this.api.get<Salon>(`/salons/${id}`).pipe(
      tap((salon) => {
        this.selectedSalonSubject.next(salon);
      })
    );
  }

  getMySalons(): Observable<Salon[]> {
    return this.api.get<Salon[]>('/salons/my-salons').pipe(
      tap((salons) => {
        this.salonsSubject.next(salons);
      })
    );
  }

  createSalon(data: any): Observable<Salon> {
    return this.api.post<Salon>('/salons', data).pipe(
      tap((salon) => {
        const current = this.salonsSubject.value;
        this.salonsSubject.next([...current, salon]);
      })
    );
  }

  updateSalon(id: string, data: any): Observable<Salon> {
    return this.api.put<Salon>(`/salons/${id}`, data).pipe(
      tap((salon) => {
        this.selectedSalonSubject.next(salon);
        const salons = this.salonsSubject.value.map((s) => (s.id === id ? salon : s));
        this.salonsSubject.next(salons);
      })
    );
  }

  deleteSalon(id: string): Observable<void> {
    return this.api.delete<void>(`/salons/${id}`).pipe(
      tap(() => {
        const salons = this.salonsSubject.value.filter((s) => s.id !== id);
        this.salonsSubject.next(salons);
      })
    );
  }

  toggleSalonStatus(id: string): Observable<Salon> {
    return this.api.patch<Salon>(`/salons/${id}/toggle-status`, {}).pipe(
      tap((salon) => {
        this.selectedSalonSubject.next(salon);
      })
    );
  }

  // ========================================
  // WORKING HOURS
  // ========================================

  getWorkingHours(salonId: string): Observable<WorkingHours[]> {
    return this.api.get<WorkingHours[]>(`/salons/${salonId}/working-hours`);
  }

  updateWorkingHours(salonId: string, hours: WorkingHours[]): Observable<WorkingHours[]> {
    return this.api.put<WorkingHours[]>(`/salons/${salonId}/working-hours`, { workingHours: hours });
  }

  // ========================================
  // HELPERS
  // ========================================

  setSelectedSalon(salon: Salon | null): void {
    this.selectedSalonSubject.next(salon);
  }

  getSelectedSalon(): Salon | null {
    return this.selectedSalonSubject.value;
  }
}
```

---

## 📝 FILE 4: service.service.ts

**Path:** `src/app/core/services/service.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Service } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private servicesSubject = new BehaviorSubject<Service[]>([]);
  services$ = this.servicesSubject.asObservable();

  constructor(private api: ApiService) {}

  // ========================================
  // SERVICE CRUD
  // ========================================

  getServices(salonId: string, params?: any): Observable<Service[]> {
    return this.api.get<Service[]>(`/salons/${salonId}/services`, params).pipe(
      tap((services) => {
        this.servicesSubject.next(services);
      })
    );
  }

  getServiceById(salonId: string, serviceId: string): Observable<Service> {
    return this.api.get<Service>(`/salons/${salonId}/services/${serviceId}`);
  }

  createService(salonId: string, data: any): Observable<Service> {
    return this.api.post<Service>(`/salons/${salonId}/services`, data).pipe(
      tap((service) => {
        const current = this.servicesSubject.value;
        this.servicesSubject.next([...current, service]);
      })
    );
  }

  updateService(salonId: string, serviceId: string, data: any): Observable<Service> {
    return this.api.put<Service>(`/salons/${salonId}/services/${serviceId}`, data).pipe(
      tap((service) => {
        const services = this.servicesSubject.value.map((s) => (s.id === serviceId ? service : s));
        this.servicesSubject.next(services);
      })
    );
  }

  deleteService(salonId: string, serviceId: string): Observable<void> {
    return this.api.delete<void>(`/salons/${salonId}/services/${serviceId}`).pipe(
      tap(() => {
        const services = this.servicesSubject.value.filter((s) => s.id !== serviceId);
        this.servicesSubject.next(services);
      })
    );
  }

  hardDeleteService(salonId: string, serviceId: string): Observable<void> {
    return this.api.delete<void>(`/salons/${salonId}/services/${serviceId}/hard`).pipe(
      tap(() => {
        const services = this.servicesSubject.value.filter((s) => s.id !== serviceId);
        this.servicesSubject.next(services);
      })
    );
  }

  toggleServiceStatus(salonId: string, serviceId: string): Observable<Service> {
    return this.api.patch<Service>(`/salons/${salonId}/services/${serviceId}/toggle`, {});
  }

  // ========================================
  // HELPERS
  // ========================================

  getServicesByIds(services: Service[]): Service[] {
    return this.servicesSubject.value.filter((s) => services.some((service) => service.id === s.id));
  }

  calculateTotalPrice(services: Service[]): number {
    return services.reduce((total, service) => total + service.price, 0);
  }

  calculateTotalDuration(services: Service[]): number {
    return services.reduce((total, service) => total + service.durationMinutes, 0);
  }
}
```

---

## 📝 FILE 5: booking.service.ts

**Path:** `src/app/core/services/booking.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Booking } from '../models';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private myBookingsSubject = new BehaviorSubject<Booking[]>([]);
  myBookings$ = this.myBookingsSubject.asObservable();

  private selectedBookingSubject = new BehaviorSubject<Booking | null>(null);
  selectedBooking$ = this.selectedBookingSubject.asObservable();

  private salonBookingsSubject = new BehaviorSubject<Booking[]>([]);
  salonBookings$ = this.salonBookingsSubject.asObservable();

  constructor(private api: ApiService) {}

  // ========================================
  // BOOKING CRUD
  // ========================================

  createBooking(data: any): Observable<Booking> {
    return this.api.post<Booking>('/bookings', data).pipe(
      tap((booking) => {
        const current = this.myBookingsSubject.value;
        this.myBookingsSubject.next([...current, booking]);
      })
    );
  }

  getMyBookings(status?: string): Observable<Booking[]> {
    const params = status ? { status } : undefined;
    return this.api.get<Booking[]>('/bookings/my-bookings', params).pipe(
      tap((bookings) => {
        this.myBookingsSubject.next(bookings);
      })
    );
  }

  getBookingById(id: string): Observable<Booking> {
    return this.api.get<Booking>(`/bookings/${id}`).pipe(
      tap((booking) => {
        this.selectedBookingSubject.next(booking);
      })
    );
  }

  getSalonBookings(salonId: string, params?: any): Observable<Booking[]> {
    return this.api.get<Booking[]>(`/salons/${salonId}/bookings`, params).pipe(
      tap((bookings) => {
        this.salonBookingsSubject.next(bookings);
      })
    );
  }

  // ========================================
  // BOOKING ACTIONS
  // ========================================

  acceptBooking(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/accept`, {}).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  rejectBooking(id: string, rejectionReason?: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/reject`, { rejectionReason }).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  startBooking(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/start`, {}).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  completeBooking(id: string): Observable<Booking> {
    return this.api.patch<Booking>(`/bookings/${id}/complete`, {}).pipe(
      tap((booking) => {
        this.updateBookingInLists(booking);
      })
    );
  }

  // ========================================
  // QUEUE
  // ========================================

  getSalonQueue(salonId: string): Observable<Booking[]> {
    return this.api.get<Booking[]>(`/salons/${salonId}/queue`);
  }

  // ========================================
  // HELPERS
  // ========================================

  private updateBookingInLists(booking: Booking): void {
    if (this.selectedBookingSubject.value?.id === booking.id) {
      this.selectedBookingSubject.next(booking);
    }

    const myBookings = this.myBookingsSubject.value.map((b) => (b.id === booking.id ? booking : b));
    this.myBookingsSubject.next(myBookings);

    const salonBookings = this.salonBookingsSubject.value.map((b) => (b.id === booking.id ? booking : b));
    this.salonBookingsSubject.next(salonBookings);
  }

  getSelectedBooking(): Booking | null {
    return this.selectedBookingSubject.value;
  }

  setSelectedBooking(booking: Booking | null): void {
    this.selectedBookingSubject.next(booking);
  }
}
```

---

## 📝 FILE 6: queue.service.ts

**Path:** `src/app/core/services/queue.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { QueuePosition } from '../models';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  constructor(private api: ApiService) {}

  // ========================================
  // QUEUE POSITION
  // ========================================

  getQueuePosition(bookingId: string): Observable<QueuePosition> {
    return this.api.get<QueuePosition>(`/bookings/${bookingId}/queue-position`);
  }

  // ========================================
  // HELPERS
  // ========================================

  calculateWaitTime(position: number, avgDurationMinutes: number = 30): number {
    if (position <= 1) return 0;
    return (position - 1) * avgDurationMinutes;
  }

  formatWaitTime(minutes: number): string {
    if (minutes === 0) return 'Next in queue';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getQueuePositionClass(position: number): string {
    if (position === 1) return 'queue-next';
    if (position <= 3) return 'queue-soon';
    return 'queue-waiting';
  }
}
```

---

## 📝 FILE 7: Create index.ts

**Path:** `src/app/core/services/index.ts`

```typescript
export * from './auth.service';
export * from './api.service';
export * from './salon.service';
export * from './service.service';
export * from './booking.service';
export * from './queue.service';
```

---

## ✅ Verification Checklist

After Copilot completes this task:

- [ ] `auth.service.ts` created with login, register, logout, token management
- [ ] `api.service.ts` created with HTTP wrapper methods (get, post, put, patch, delete)
- [ ] `salon.service.ts` created with salon CRUD and working hours management
- [ ] `service.service.ts` created with service CRUD and helpers
- [ ] `booking.service.ts` created with booking operations and queue logic
- [ ] `queue.service.ts` created with queue position calculations
- [ ] `index.ts` created for barrel exports
- [ ] All services injectable with providedIn: 'root'
- [ ] All observables properly typed

---

## 🎯 Next Step

After this task completes:
1. Verify no compilation errors: `ng serve`
2. Proceed to **TASK_5_GUARDS_INTERCEPTORS.md**

---

**Status: Ready for Copilot Agent Mode ✅**

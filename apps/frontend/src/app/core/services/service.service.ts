import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Service as SalonServiceModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private servicesSubject = new BehaviorSubject<SalonServiceModel[]>([]);
  services$ = this.servicesSubject.asObservable();

  constructor(private api: ApiService) {}

  private mapService(service: any): SalonServiceModel {
    return {
      ...service,
      price: service && service.price ? Number(service.price) : 0,
      durationMinutes: service && service.durationMinutes ? Number(service.durationMinutes) : 0,
    };
  }

  getServices(salonId: string, params?: any) {
    return this.api.get<SalonServiceModel[]>(`/salons/${salonId}/services`, params).pipe(
      map((services) => (services || []).map(s => this.mapService(s))),
      tap((services) => {
        this.servicesSubject.next(services);
      })
    );
  }

  getServiceById(salonId: string, serviceId: string) {
    return this.api.get<SalonServiceModel>(`/salons/${salonId}/services/${serviceId}`).pipe(
      map(s => this.mapService(s))
    );
  }

  createService(salonId: string, data: any) {
    return this.api.post<SalonServiceModel>(`/salons/${salonId}/services`, data).pipe(
      map(s => this.mapService(s)),
      tap((service) => {
        const current = this.servicesSubject.value;
        this.servicesSubject.next([...current, service]);
      })
    );
  }

  updateService(salonId: string, serviceId: string, data: any) {
    return this.api.put<SalonServiceModel>(`/salons/${salonId}/services/${serviceId}`, data).pipe(
      map(s => this.mapService(s)),
      tap((service) => {
        const services = this.servicesSubject.value.map((s) => (s.id === serviceId ? service : s));
        this.servicesSubject.next(services);
      })
    );
  }

  deleteService(salonId: string, serviceId: string) {
    return this.api.delete<void>(`/salons/${salonId}/services/${serviceId}`).pipe(
      tap(() => {
        const services = this.servicesSubject.value.filter((s) => s.id !== serviceId);
        this.servicesSubject.next(services);
      })
    );
  }

  hardDeleteService(salonId: string, serviceId: string) {
    return this.api.delete<void>(`/salons/${salonId}/services/${serviceId}/hard`).pipe(
      tap(() => {
        const services = this.servicesSubject.value.filter((s) => s.id !== serviceId);
        this.servicesSubject.next(services);
      })
    );
  }

  toggleServiceStatus(salonId: string, serviceId: string) {
    return this.api.patch<SalonServiceModel>(`/salons/${salonId}/services/${serviceId}/toggle`, {});
  }

  getServicesByIds(services: SalonServiceModel[]): SalonServiceModel[] {
    return this.servicesSubject.value.filter((s) => services.some((service) => service.id === s.id));
  }

  calculateTotalPrice(services: SalonServiceModel[]): number {
    return services.reduce((total, service) => total + service.price, 0);
  }

  calculateTotalDuration(services: SalonServiceModel[]): number {
    return services.reduce((total, service) => total + service.durationMinutes, 0);
  }
}

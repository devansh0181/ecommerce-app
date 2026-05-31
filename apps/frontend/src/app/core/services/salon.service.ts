import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Salon, WorkingHours } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SalonService {
  private salonsSubject = new BehaviorSubject<Salon[]>([]);
  salons$ = this.salonsSubject.asObservable();

  private selectedSalonSubject = new BehaviorSubject<Salon | null>(null);
  selectedSalon$ = this.selectedSalonSubject.asObservable();

  constructor(private api: ApiService) {}

  getSalons(params?: any) {
    return this.api.get<{ data: Salon[]; total: number }>('/salons', params).pipe(
      tap((response) => {
        this.salonsSubject.next(response.data);
      })
    );
  }

  getSalonById(id: string) {
    return this.api.get<Salon>(`/salons/${id}`).pipe(
      tap((salon) => {
        this.selectedSalonSubject.next(salon);
      })
    );
  }

  getMySalons() {
    return this.api.get<Salon[]>('/salons/my-salons').pipe(
      tap((salons) => {
        this.salonsSubject.next(salons);
      })
    );
  }

  createSalon(data: any) {
    return this.api.post<Salon>('/salons', data).pipe(
      tap((salon) => {
        const current = this.salonsSubject.value;
        this.salonsSubject.next([...current, salon]);
      })
    );
  }

  updateSalon(id: string, data: any) {
    return this.api.put<Salon>(`/salons/${id}`, data).pipe(
      tap((salon) => {
        this.selectedSalonSubject.next(salon);
        const salons = this.salonsSubject.value.map((s) => (s.id === id ? salon : s));
        this.salonsSubject.next(salons);
      })
    );
  }

  deleteSalon(id: string) {
    return this.api.delete<void>(`/salons/${id}`).pipe(
      tap(() => {
        const salons = this.salonsSubject.value.filter((s) => s.id !== id);
        this.salonsSubject.next(salons);
      })
    );
  }

  toggleSalonStatus(id: string) {
    return this.api.patch<Salon>(`/salons/${id}/toggle-status`, {}).pipe(
      tap((salon) => {
        this.selectedSalonSubject.next(salon);
      })
    );
  }

  getWorkingHours(salonId: string) {
    return this.api.get<WorkingHours[]>(`/salons/${salonId}/working-hours`);
  }

  updateWorkingHours(salonId: string, hours: WorkingHours[]) {
    return this.api.put<WorkingHours[]>(`/salons/${salonId}/working-hours`, { workingHours: hours });
  }

  setSelectedSalon(salon: Salon | null): void {
    this.selectedSalonSubject.next(salon);
  }

  getSelectedSalon(): Salon | null {
    return this.selectedSalonSubject.value;
  }
}

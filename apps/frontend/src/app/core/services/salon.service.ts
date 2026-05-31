import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalonService {
  private salonsSubject = new BehaviorSubject<any[]>([]);
  public salons$ = this.salonsSubject.asObservable();

  constructor() {}

  getSalons(filters?: any): Observable<any> {
    return new Observable();
  }

  getSalonById(id: string): Observable<any> {
    return new Observable();
  }

  createSalon(data: any): Observable<any> {
    return new Observable();
  }

  updateSalon(id: string, data: any): Observable<any> {
    return new Observable();
  }

  deleteSalon(id: string): Observable<any> {
    return new Observable();
  }

  getWorkingHours(salonId: string): Observable<any> {
    return new Observable();
  }

  updateWorkingHours(salonId: string, data: any): Observable<any> {
    return new Observable();
  }
}

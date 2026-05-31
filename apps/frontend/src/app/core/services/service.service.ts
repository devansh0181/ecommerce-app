import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor() {}

  getServices(salonId: string): Observable<any> {
    return new Observable();
  }

  getServiceById(salonId: string, serviceId: string): Observable<any> {
    return new Observable();
  }

  createService(salonId: string, data: any): Observable<any> {
    return new Observable();
  }

  updateService(salonId: string, serviceId: string, data: any): Observable<any> {
    return new Observable();
  }

  deleteService(salonId: string, serviceId: string): Observable<any> {
    return new Observable();
  }

  toggleService(salonId: string, serviceId: string): Observable<any> {
    return new Observable();
  }
}

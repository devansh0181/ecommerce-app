import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private toasts: Toast[] = [];

  constructor(private ngZone: NgZone) {}

  success(message: string, title: string = 'Success', duration = 3000): void {
    this.show({ title, message, type: 'success', duration });
  }

  error(message: string, title: string = 'Error', duration = 5000): void {
    this.show({ title, message, type: 'error', duration });
  }

  warning(message: string, title: string = 'Warning', duration = 4000): void {
    this.show({ title, message, type: 'warning', duration });
  }

  info(message: string, title: string = 'Info', duration = 3000): void {
    this.show({ title, message, type: 'info', duration });
  }

  remove(id: string): void {
    this.ngZone.run(() => {
      this.toasts = this.toasts.filter((t) => t.id !== id);
      this.toastsSubject.next([...this.toasts]);
    });
  }

  getToasts(): Toast[] {
    return this.toasts;
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = { ...toast, id };

    this.ngZone.run(() => {
      this.toasts.push(newToast);
      this.toastsSubject.next([...this.toasts]);

      if (toast.duration) {
        setTimeout(() => {
          this.remove(id);
        }, toast.duration);
      }
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

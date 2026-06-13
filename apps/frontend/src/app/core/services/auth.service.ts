import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  token$ = this.tokenSubject.asObservable();

  isAuthenticated$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.currentUserSubject.next(this.loadUserFromStorage());
    this.tokenSubject.next(this.getTokenFromStorage());
  }

  register(data: RegisterRequest) {
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

  login(data: LoginRequest) {
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

  checkEmailAvailability(email: string) {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-email`, {
      params: { email },
    });
  }

  updateProfile(data: { firstName: string; lastName: string; phone?: string; password?: string }) {
    return this.http.put<User>(`${this.apiUrl}/profile`, data).pipe(
      tap((updatedUser) => {
        const token = this.getToken();
        if (token) {
          this.setUser(updatedUser, token);
        }
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string; resetToken?: string }>(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, password });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

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

  private setUser(user: User, token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('accessToken', token);
    }
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }

  private getTokenFromStorage(): string | null {
    return this.isBrowser() ? localStorage.getItem('accessToken') : null;
  }

  private loadUserFromStorage(): User | null {
    if (!this.isBrowser()) {
      return null;
    }

    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}

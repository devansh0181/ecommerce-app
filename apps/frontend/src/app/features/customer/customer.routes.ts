import { Routes } from '@angular/router';
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout.component';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    component: CustomerLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'salons',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/salons/salon-list/salon-list.component').then((m) => m.SalonListComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/salons/salon-detail/salon-detail.component').then((m) => m.SalonDetailComponent),
          },
        ],
      },
      {
        path: 'bookings',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/bookings/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/bookings/booking-detail/booking-detail.component').then((m) => m.BookingDetailComponent),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },
];

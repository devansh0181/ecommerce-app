import { Routes } from '@angular/router';
import { BarberLayoutComponent } from './layouts/barber-layout/barber-layout.component';

export const BARBER_ROUTES: Routes = [
  {
    path: '',
    component: BarberLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'bookings',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/bookings/booking-requests/booking-requests.component').then((m) => m.BookingRequestsComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/bookings/booking-detail/booking-detail.component').then((m) => m.BookingDetailComponent),
          },
        ],
      },
      {
        path: 'queue',
        loadComponent: () => import('./pages/bookings/queue-view/queue-view.component').then((m) => m.QueueViewComponent),
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/services/service-list/service-list.component').then((m) => m.ServiceListComponent),
          },
        ],
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/salon-profile/salon-profile.component').then((m) => m.SalonProfileComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];

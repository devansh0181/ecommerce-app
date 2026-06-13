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
            loadComponent: () => import('./pages/services/salon-selector/salon-selector.component').then((m) => m.SalonSelectorComponent),
          },
          {
            path: ':salonId',
            loadComponent: () => import('./pages/bookings/booking-requests/booking-requests.component').then((m) => m.BookingRequestsComponent),
          },
          {
            path: 'detail/:id',
            loadComponent: () => import('./pages/bookings/booking-detail/booking-detail.component').then((m) => m.BookingDetailComponent),
          },
        ],
      },
      {
        path: 'queue',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/services/salon-selector/salon-selector.component').then((m) => m.SalonSelectorComponent),
          },
          {
            path: ':salonId',
            loadComponent: () => import('./pages/bookings/queue-view/queue-view.component').then((m) => m.QueueViewComponent),
          },
        ],
      },
      {
        path: 'services',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/services/salon-selector/salon-selector.component').then((m) => m.SalonSelectorComponent),
          },
          {
            path: ':salonId',
            loadComponent: () => import('./pages/services/service-list/service-list.component').then((m) => m.ServiceListComponent),
          },
        ],
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/salon-profile/salon-profile.component').then((m) => m.SalonProfileComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/salon-profile/salon-detail/salon-detail.component').then((m) => m.SalonDetailComponent),
          },
        ],
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
      },
    ],
  },
];

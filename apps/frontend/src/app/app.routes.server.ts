import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'customer/salons/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'customer/bookings/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'barber/bookings/detail/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'barber/bookings/:salonId',
    renderMode: RenderMode.Client,
  },
  {
    path: 'barber/profile/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'barber/services/:salonId',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

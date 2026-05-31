import { Routes } from '@angular/router';
import { JwtAuthGuard, RoleGuard } from '@core/guards';

export const routes: Routes = [
	{
		path: '',
		redirectTo: '/auth/login',
		pathMatch: 'full',
	},
	{
		path: 'auth',
		loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
	},
	{
		path: 'customer',
		canActivate: [JwtAuthGuard, RoleGuard],
		data: { roles: ['CUSTOMER'] },
		loadChildren: () => import('./features/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
	},
	{
		path: 'barber',
		canActivate: [JwtAuthGuard, RoleGuard],
		data: { roles: ['BARBER'] },
		loadChildren: () => import('./features/barber/barber.routes').then((m) => m.BARBER_ROUTES),
	},
	{
		path: '**',
		redirectTo: '/auth/login',
	},
];

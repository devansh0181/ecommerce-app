import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Salon } from '../../../../../core/models';
import { SalonService } from '../../../../../core/services/salon.service';

@Component({
  selector: 'app-salon-selector',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './salon-selector.component.html',
  styleUrls: ['./salon-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalonSelectorComponent implements OnInit, OnDestroy {
  loading = false;
  error: string | null = null;
  salons: Salon[] = [];

  mode: 'bookings' | 'queue' | 'services' = 'services';
  eyebrow = 'Services Catalog';
  title = 'Select a Salon';
  subtitle = 'Please select one of your salons below to view, manage, or add services.';
  buttonText = 'Manage Services';

  private routerSub?: Subscription;

  constructor(
    private salonService: SalonService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.evaluateMode();
    this.loadSalons();

    // Router reuses the same component instance for sibling child routes.
    // Subscribe to router events to re-evaluate parameters on navigation.
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.evaluateMode();
      this.loadSalons();
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private evaluateMode(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('bookings')) {
      this.mode = 'bookings';
      this.eyebrow = 'Booking Requests';
      this.title = 'Select a Salon';
      this.subtitle = 'Please select one of your salons below to view its booking requests.';
      this.buttonText = 'View Requests';
    } else if (currentUrl.includes('queue')) {
      this.mode = 'queue';
      this.eyebrow = 'Queue Management';
      this.title = 'Select a Salon';
      this.subtitle = 'Please select one of your salons below to manage its queue.';
      this.buttonText = 'View Queue';
    } else {
      this.mode = 'services';
      this.eyebrow = 'Services Catalog';
      this.title = 'Select a Salon';
      this.subtitle = 'Please select one of your salons below to view, manage, or add services.';
      this.buttonText = 'Manage Services';
    }
    this.cdr.markForCheck();
  }

  loadSalons(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.salonService.getMySalons().subscribe({
      next: (salons: Salon[]) => {
        this.salons = salons || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('SalonSelectorComponent: Error loading salons:', err);
        this.error = 'Unable to load your salons. Please make sure the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectSalon(salonId: string): void {
    if (this.mode === 'bookings') {
      this.router.navigate(['/barber/bookings', salonId]);
    } else if (this.mode === 'queue') {
      this.router.navigate(['/barber/queue', salonId]);
    } else {
      this.router.navigate(['/barber/services', salonId]);
    }
  }
}

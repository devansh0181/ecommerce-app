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

  isBookingMode = false;
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
    this.isBookingMode = currentUrl.includes('bookings');
    if (this.isBookingMode) {
      this.eyebrow = 'Booking Requests';
      this.title = 'Select a Salon';
      this.subtitle = 'Please select one of your salons below to view its booking requests.';
      this.buttonText = 'View Requests';
    } else {
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
    if (this.isBookingMode) {
      this.router.navigate(['/barber/bookings', salonId]);
    } else {
      this.router.navigate(['/barber/services', salonId]);
    }
  }
}

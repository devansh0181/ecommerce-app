import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Salon } from '../../../../../core/models';
import { SalonService } from '../../../../../core/services/salon.service';
import { SalonCardComponent } from '../../..//components/salon-card/salon-card.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-salon-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SalonCardComponent, RouterModule],
  templateUrl: './salon-list.component.html',
  styleUrls: ['./salon-list.component.scss'],
})
export class SalonListComponent implements OnInit, OnDestroy {
  search = new FormControl('');
  openOnly = false;
  minRating = 0;
  distance = 50;

  salons: Salon[] = [];
  loading = false;
  error: string | null = null;
  page = 1;
  limit = 12;
  total = 0;

  private loadSubscription?: Subscription;

  constructor(
    private salonService: SalonService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.loadSalons(true));

    this.loadSalons(true);
  }

  ngOnDestroy(): void {
    this.loadSubscription?.unsubscribe();
  }

  private buildParams() {
    const params: any = { page: this.page, limit: this.limit };
    const q = this.search.value?.trim();
    if (q) params.search = q;
    if (this.openOnly) params.isOpen = true;
    if (this.minRating) params.minRating = this.minRating;
    // if (this.distance) params.distance = this.distance;
    return params;
  }

  loadSalons(reset = false) {
    if (reset) {
      this.page = 1;
      this.salons = [];
    }

    this.loadSubscription?.unsubscribe();
    this.loading = true;
    this.error = null;
    const params = this.buildParams();

    this.loadSubscription = this.salonService
      .getSalons(params)
      .pipe(
        catchError((err: any) => {
          console.error('Failed to load salons', err);
          this.error = 'Failed to load salons';
          return of({ data: [] as Salon[], total: 0, page: this.page, limit: this.limit });
        }),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res: any) => {
        const items = this.extractItems(res);
        const total = this.extractTotal(res, items);

        if (reset) this.salons = items;
        else this.salons = [...this.salons, ...items];
        this.total = total;
      });
  }

  private extractItems(response: any): Salon[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.data)) return response.data.data;
    if (response.data && Array.isArray(response.data.items)) return response.data.items;
    return [];
  }

  private extractTotal(response: any, items: Salon[]): number {
    if (!response) return items.length;
    if (typeof response.total === 'number') return response.total;
    if (response.data && typeof response.data.total === 'number') return response.data.total;
    return items.length;
  }

  onToggleOpen() {
    this.openOnly = !this.openOnly;
    this.loadSalons(true);
  }

  onMinRatingChange(value: number) {
    this.minRating = value;
    this.loadSalons(true);
  }

  onDistanceChange(value: number) {
    this.distance = value;
    this.loadSalons(true);
  }

  clearFilters() {
    this.openOnly = false;
    this.minRating = 0;
    this.distance = 50;
    this.search.setValue('', { emitEvent: false });
    this.loadSalons(true);
  }

  loadMore() {
    if (this.salons.length >= this.total) return;
    this.page += 1;
    this.loadSalons(false);
  }

  trackBySalon(index: number, salon: Salon) {
    return salon.id;
  }

  selectSalon(salon: Salon) {
    this.salonService.setSelectedSalon(salon);
    this.router.navigate([salon.id], { relativeTo: this.route });
  }
}


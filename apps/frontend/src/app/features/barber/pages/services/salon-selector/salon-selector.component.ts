import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
export class SalonSelectorComponent implements OnInit {
  loading = false;
  error: string | null = null;
  salons: Salon[] = [];

  constructor(
    private salonService: SalonService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSalons();
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
    this.router.navigate(['/barber/services', salonId]);
  }
}

import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Salon } from '../../../../core/models';
import { SalonService } from '../../../../core/services/salon.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { SalonCreateDialogComponent } from './salon-create-dialog/salon-create-dialog.component';

@Component({
  selector: 'app-salon-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule],
  templateUrl: './salon-profile.component.html',
  styleUrls: ['./salon-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalonProfileComponent implements OnInit {
  loading = false;
  error: string | null = null;
  salons: Salon[] = [];

  constructor(
    private salonService: SalonService,
    private toast: ToastService,
    private dialog: MatDialog,
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
        console.error('SalonProfileComponent: Error loading salons:', err);
        this.error = 'Unable to load your salons. Please make sure the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  isSetupCompleted(salon: Salon): boolean {
    return !!(salon.workingHours && salon.workingHours.length > 0);
  }

  navigateToSalon(salonId: string): void {
    this.router.navigate(['/barber/profile', salonId]);
  }

  openCreateSalonDialog(): void {
    const dialogRef = this.dialog.open(SalonCreateDialogComponent, {
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((newSalon: Salon | undefined) => {
      if (newSalon && newSalon.id) {
        this.router.navigate(['/barber/profile', newSalon.id]);
      } else {
        this.loadSalons();
      }
    });
  }
}

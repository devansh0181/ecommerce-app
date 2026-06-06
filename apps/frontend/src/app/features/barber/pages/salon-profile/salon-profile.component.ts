import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Salon } from '../../../../core/models';
import { SalonService } from '../../../../core/services/salon.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { SalonInfoSectionComponent } from './salon-info-section.component';
import { WorkingHoursSectionComponent } from './working-hours-section.component';
import { SalonCreateDialogComponent } from './salon-create-dialog/salon-create-dialog.component';

@Component({
  selector: 'app-salon-profile',
  standalone: true,
  imports: [CommonModule, MatDialogModule, SalonInfoSectionComponent, WorkingHoursSectionComponent],
  templateUrl: './salon-profile.component.html',
  styleUrls: ['./salon-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalonProfileComponent implements OnInit {
  loading = false;
  error: string | null = null;
  salon: Salon | null = null;
  statusPending = false;

  constructor(
    private salonService: SalonService,
    private toast: ToastService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSalonProfile();
  }

  loadSalonProfile(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.salonService.getMySalons().subscribe({
      next: (salons: Salon[]) => {
        if (!salons || salons.length === 0) {
          this.error = 'No salon found for this account.';
          this.salon = null;
        } else {
          this.salon = salons[0];
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('SalonProfileComponent: Error loading salon profile:', err);
        this.error = 'Unable to load salon profile. Please make sure the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      },
      complete: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSalonInfoUpdated(updatedSalon: Salon): void {
    this.salon = { ...updatedSalon };
    this.toast.success('Salon information updated successfully.');
    this.cdr.markForCheck();
  }

  onWorkingHoursUpdated(): void {
    // Instead of reloading everything, we just refresh the salon basic info
    // The WorkingHoursSectionComponent handles its own internal refresh
    this.salonService.getMySalons().subscribe({
      next: (salons) => {
        if (salons && salons.length > 0) {
          this.salon = { ...salons[0] };
        }
        this.cdr.markForCheck();
      }
    });
    this.toast.success('Working hours updated successfully.');
  }

  toggleSalonStatus(): void {
    if (!this.salon) return;

    this.statusPending = true;
    this.cdr.markForCheck();

    this.salonService.toggleSalonStatus(this.salon.id).subscribe({
      next: (updatedSalon) => {
        this.salon = { ...updatedSalon };
        this.toast.success(`Salon is now ${updatedSalon.isOpen ? 'Open' : 'Closed'}.`);
        this.statusPending = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to update salon status.');
        this.statusPending = false;
        this.cdr.markForCheck();
      }
    });
  }

  openCreateSalonDialog(): void {
    const dialogRef = this.dialog.open(SalonCreateDialogComponent, {
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadSalonProfile();
      }
    });
  }
}

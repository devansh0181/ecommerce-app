import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Salon } from '../../../../../core/models';
import { SalonService } from '../../../../../core/services/salon.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { SalonInfoSectionComponent } from '../salon-info-section.component';
import { WorkingHoursSectionComponent } from '../working-hours-section.component';

@Component({
  selector: 'app-salon-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, SalonInfoSectionComponent, WorkingHoursSectionComponent],
  templateUrl: './salon-detail.component.html',
  styleUrls: ['./salon-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalonDetailComponent implements OnInit {
  salonId: string | null = null;
  salon: Salon | null = null;
  loading = false;
  error: string | null = null;
  statusTogglePending = false;

  constructor(
    private route: ActivatedRoute,
    private salonService: SalonService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.salonId = params.get('id');
      if (this.salonId) {
        this.loadSalonDetails(this.salonId);
      }
    });
  }

  loadSalonDetails(id: string): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.salonService.getSalonById(id).subscribe({
      next: (salon: Salon) => {
        this.salon = salon;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('SalonDetailComponent: Error loading salon detail:', err);
        this.error = 'Failed to load salon details. Please check if the backend is running.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  isSetupCompleted(): boolean {
    if (!this.salon) return false;
    return !!(this.salon.workingHours && this.salon.workingHours.length > 0);
  }

  onSalonInfoUpdated(updatedSalon: Salon): void {
    this.salon = { ...updatedSalon };
    this.toast.success('Salon details updated successfully.');
    this.cdr.markForCheck();
  }

  onWorkingHoursUpdated(): void {
    if (this.salonId) {
      // Reload to ensure we fetch the updated workingHours relation and update setup status
      this.salonService.getSalonById(this.salonId).subscribe({
        next: (updatedSalon: Salon) => {
          this.salon = updatedSalon;
          this.toast.success('Working hours updated successfully.');
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('SalonDetailComponent: Error refreshing hours:', err);
          this.cdr.markForCheck();
        }
      });
    }
  }

  toggleSalonStatus(): void {
    if (!this.salon || this.statusTogglePending) return;

    this.statusTogglePending = true;
    this.cdr.markForCheck();

    this.salonService.toggleSalonStatus(this.salon.id).subscribe({
      next: (updatedSalon: Salon) => {
        this.salon = { ...updatedSalon };
        this.toast.success(`Salon is now ${updatedSalon.isOpen ? 'Open' : 'Closed'}.`);
        this.statusTogglePending = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Failed to toggle salon status.');
        this.statusTogglePending = false;
        this.cdr.markForCheck();
      }
    });
  }
}

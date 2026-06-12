import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Service as SalonService } from '../../../../../core/models';
import { ServiceService } from '../../../../../core/services/service.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ServiceFormDialogComponent } from '../service-form-dialog/service-form-dialog.component';

@Component({
  selector: 'app-barber-service-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, RouterModule],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceListComponent implements OnInit {
  loading = false;
  error: string | null = null;
  services: SalonService[] = [];
  actionPendingId: string | null = null;
  deletingServiceId: string | null = null;
  salonId: string | null = null;
  search = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.salonId = params.get('salonId');
      if (this.salonId) {
        this.loadServices(this.salonId);
      } else {
        this.error = 'No salon location resolved from route params.';
        this.cdr.markForCheck();
      }
    });

    this.search.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  get filteredServices(): SalonService[] {
    const term = this.search.value?.toString().trim().toLowerCase();
    if (!term) {
      return this.services;
    }

    return this.services.filter((service) => {
      const name = service.name?.toLowerCase() ?? '';
      const description = service.description?.toLowerCase() ?? '';
      return name.includes(term) || description.includes(term);
    });
  }

  refresh(): void {
    if (this.salonId) {
      this.loadServices(this.salonId);
    }
  }

  loadServices(salonId: string): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.serviceService.getServices(salonId).subscribe({
      next: (services) => {
        this.services = services || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('ServiceListComponent: Error loading services:', err);
        this.error = 'Unable to load services right now. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  openServiceDialog(service?: SalonService): void {
    if (!this.salonId) {
      this.toast.error('Salon not available. Please try again.');
      return;
    }

    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '520px',
      data: { salonId: this.salonId, service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadServices(this.salonId!);
      }
      this.cdr.markForCheck();
    });
  }

  confirmDeleteService(service: SalonService): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete service',
        message: `Are you sure you want to delete "${service.name}"? This cannot be undone.`,
        confirmText: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteService(service);
      }
      this.cdr.markForCheck();
    });
  }

  private deleteService(service: SalonService): void {
    if (!this.salonId) {
      this.toast.error('Salon not available. Please refresh and try again.');
      return;
    }

    this.deletingServiceId = service.id;
    this.cdr.markForCheck();

    this.serviceService.deleteService(this.salonId, service.id).subscribe({
      next: () => {
        this.toast.success('Service deleted successfully.');
        this.services = this.services.filter((item) => item.id !== service.id);
        this.deletingServiceId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Unable to delete the service. Please try again.');
        this.deletingServiceId = null;
        this.cdr.markForCheck();
      }
    });
  }

  toggleServiceStatus(service: SalonService): void {
    if (!this.salonId) {
      this.toast.error('Salon not available. Please refresh and try again.');
      return;
    }

    this.actionPendingId = service.id;
    this.cdr.markForCheck();

    this.serviceService.toggleServiceStatus(this.salonId, service.id).subscribe({
      next: (updated) => {
        this.toast.success(`${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}.`);
        this.services = this.services.map((item) => (item.id === service.id ? updated : item));
        this.actionPendingId = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Unable to update service status. Please try again.');
        this.actionPendingId = null;
        this.cdr.markForCheck();
      }
    });
  }
}

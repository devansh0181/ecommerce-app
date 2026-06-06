import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Service as SalonService } from '../../../../../core/models';
import { SalonService as SalonApiService } from '../../../../../core/services/salon.service';
import { ServiceService } from '../../../../../core/services/service.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ServiceFormDialogComponent } from '../service-form-dialog/service-form-dialog.component';

@Component({
  selector: 'app-barber-service-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss'],
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
    private salonService: SalonApiService,
    private serviceService: ServiceService,
    private dialog: MatDialog,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadServices();
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
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.error = null;

    this.salonService.getMySalons().subscribe(
      (salons) => {
        const salon = salons?.[0] ?? null;
        if (!salon) {
          this.error = 'No salon found for this account.';
          this.loading = false;
          return;
        }

        this.salonId = salon.id;
        this.serviceService.getServices(salon.id).subscribe(
          (services) => {
            this.services = services || [];
            this.loading = false;
          },
          () => {
            this.error = 'Unable to load services right now. Please try again.';
            this.loading = false;
          }
        );
      },
      () => {
        this.error = 'Unable to resolve your salon. Please check your connection and try again.';
        this.loading = false;
      }
    );
  }

  openServiceDialog(service?: SalonService): void {
    const dialogRef = this.dialog.open(ServiceFormDialogComponent, {
      width: '520px',
      data: { salonId: this.salonId, service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadServices();
      }
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
    });
  }

  private deleteService(service: SalonService): void {
    if (!this.salonId) {
      this.toast.error('Salon not available. Please refresh and try again.');
      return;
    }

    this.deletingServiceId = service.id;
    this.serviceService.deleteService(this.salonId, service.id).subscribe(
      () => {
        this.toast.success('Service deleted successfully.');
        this.services = this.services.filter((item) => item.id !== service.id);
        this.deletingServiceId = null;
      },
      () => {
        this.toast.error('Unable to delete the service. Please try again.');
        this.deletingServiceId = null;
      }
    );
  }

  toggleServiceStatus(service: SalonService): void {
    if (!this.salonId) {
      this.toast.error('Salon not available. Please refresh and try again.');
      return;
    }

    this.actionPendingId = service.id;
    this.serviceService.toggleServiceStatus(this.salonId, service.id).subscribe(
      (updated) => {
        this.toast.success(`${updated.name} is now ${updated.isActive ? 'active' : 'inactive'}.`);
        this.services = this.services.map((item) => (item.id === service.id ? updated : item));
        this.actionPendingId = null;
      },
      () => {
        this.toast.error('Unable to update service status. Please try again.');
        this.actionPendingId = null;
      }
    );
  }
}

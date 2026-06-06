import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Service as SalonService } from '../../../../../core/models';
import { ServiceService } from '../../../../../core/services/service.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

interface ServiceFormDialogData {
  salonId: string | null;
  service?: SalonService | null;
  confirmDeleteOnly?: boolean;
}

@Component({
  selector: 'app-service-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './service-form-dialog.component.html',
  styleUrls: ['./service-form-dialog.component.scss'],
})
export class ServiceFormDialogComponent {
  serviceForm: FormGroup;
  saving = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ServiceFormDialogComponent>,
    private serviceService: ServiceService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: ServiceFormDialogData
  ) {
    this.isEditMode = !!data.service;
    this.serviceForm = this.fb.group({
      name: [data.service?.name || '', [Validators.required, Validators.maxLength(80)]],
      description: [data.service?.description || '', [Validators.maxLength(240)]],
      price: [data.service?.price ?? 0, [Validators.required, Validators.min(0.5)]],
      durationMinutes: [data.service?.durationMinutes ?? 30, [Validators.required, Validators.min(5)]],
      isActive: [data.service?.isActive ?? true],
    });
  }

  get name() {
    return this.serviceForm.get('name');
  }

  get price() {
    return this.serviceForm.get('price');
  }

  get durationMinutes() {
    return this.serviceForm.get('durationMinutes');
  }

  submit(): void {
    if (!this.data.salonId) {
      this.toast.error('Salon not available. Please refresh the page before saving.');
      return;
    }

    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = {
      name: this.serviceForm.value.name.trim(),
      description: this.serviceForm.value.description?.trim() || undefined,
      price: Number(this.serviceForm.value.price),
      durationMinutes: Number(this.serviceForm.value.durationMinutes),
      isActive: this.serviceForm.value.isActive,
    };

    const action$ = this.isEditMode && this.data.service
      ? this.serviceService.updateService(this.data.salonId, this.data.service.id, payload)
      : this.serviceService.createService(this.data.salonId, payload);

    action$.subscribe(
      () => {
        this.toast.success(this.isEditMode ? 'Service updated successfully.' : 'Service created successfully.');
        this.saving = false;
        this.dialogRef.close(true);
      },
      () => {
        this.toast.error('Unable to save service. Please try again.');
        this.saving = false;
      }
    );
  }

  close(): void {
    this.dialogRef.close(false);
  }

  confirmDelete(): void {
    if (!this.data.service || !this.data.salonId) {
      return;
    }

    const confirmRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete service',
        message: `Are you sure you want to delete "${this.data.service.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
      },
    });

    confirmRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.saving = true;
      this.serviceService.deleteService(this.data.salonId!, this.data.service!.id).subscribe(
        () => {
          this.toast.success('Service deleted successfully.');
          this.saving = false;
          this.dialogRef.close(true);
        },
        () => {
          this.toast.error('Failed to delete service. Please try again.');
          this.saving = false;
        }
      );
    });
  }
}

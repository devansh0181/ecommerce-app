import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Salon } from '../../../../../core/models';
import { SalonService } from '../../../../../core/services/salon.service';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'app-salon-create-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './salon-create-dialog.component.html',
  styleUrls: ['./salon-create-dialog.component.scss'],
})
export class SalonCreateDialogComponent {
  salonForm: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SalonCreateDialogComponent>,
    private salonService: SalonService,
    private toast: ToastService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.salonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      phone: ['', [Validators.required]],
    });
  }

  get name() { return this.salonForm.get('name'); }
  get address() { return this.salonForm.get('address'); }
  get phone() { return this.salonForm.get('phone'); }

  submit(): void {
    if (this.salonForm.invalid) {
      this.salonForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = {
      name: this.salonForm.value.name.trim(),
      description: this.salonForm.value.description?.trim() || undefined,
      address: this.salonForm.value.address.trim(),
      // phone is removed from payload because the backend API does not currently support it
    };

    this.salonService.createSalon(payload).subscribe(
      (newSalon: Salon) => {
        this.toast.success('Salon created successfully!');
        this.dialogRef.close(newSalon);
      },
      () => {
        this.toast.error('Failed to create salon. Please try again.');
        this.saving = false;
      }
    );
  }

  close(): void {
    this.dialogRef.close();
  }
}

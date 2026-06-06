import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Salon } from '../../../../core/models';
import { SalonService } from '../../../../core/services/salon.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-salon-info-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salon-info-section.component.html',
  styleUrls: ['./salon-info-section.component.scss'],
})
export class SalonInfoSectionComponent implements OnInit {
  @Input() salon!: Salon;
  @Output() updated = new EventEmitter<Salon>();

  infoForm: FormGroup;
  saving = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private salonService: SalonService,
    private toast: ToastService
  ) {
    this.infoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      phone: ['', []], // Removed required validator as backend doesn't support this field
    });
  }

  ngOnInit(): void {
    if (this.salon) {
      this.infoForm.patchValue({
        name: this.salon.name,
        description: this.salon.description || '',
        address: this.salon.address,
        phone: this.salon.phone || '',
      });
    }
  }

  get name() {
    return this.infoForm.get('name');
  }

  get address() {
    return this.infoForm.get('address');
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.infoForm.reset({
        name: this.salon.name,
        description: this.salon.description || '',
        address: this.salon.address,
      });
    }
  }

  saveChanges(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = {
      name: this.infoForm.value.name.trim(),
      description: this.infoForm.value.description?.trim() || undefined,
      address: this.infoForm.value.address.trim(),
      // phone is removed from payload because the backend API does not support it
    };

    this.salonService.updateSalon(this.salon.id, payload).subscribe(
      (updatedSalon: Salon) => {
        this.updated.emit(updatedSalon);
        this.isEditing = false;
        this.saving = false;
      },
      () => {
        this.toast.error('Failed to update salon information. Please try again.');
        this.saving = false;
      }
    );
  }
}

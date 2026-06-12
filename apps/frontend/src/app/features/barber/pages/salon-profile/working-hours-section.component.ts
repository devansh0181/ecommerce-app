import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { WorkingHours } from '../../../../core/models';
import { SalonService } from '../../../../core/services/salon.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-working-hours-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './working-hours-section.component.html',
  styleUrls: ['./working-hours-section.component.scss'],
})
export class WorkingHoursSectionComponent implements OnInit {
  @Input() salonId!: string;
  @Output() updated = new EventEmitter<void>();

  hoursForm: FormGroup;
  saving = false;
  loading = false;
  error: string | null = null;

  isEditing = false;
  hasHoursSet = false;

  dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  dayValues: WorkingHours['dayOfWeek'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  constructor(
    private fb: FormBuilder,
    private salonService: SalonService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.hoursForm = this.fb.group({
      workingHours: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadWorkingHours();
  }

  get workingHoursArray(): FormArray {
    return this.hoursForm.get('workingHours') as FormArray;
  }

  loadWorkingHours(silent = false): void {
    if (!this.salonId) return;
    if (!silent) {
      this.loading = true;
      this.error = null;
      this.cdr.markForCheck();
    }

    this.salonService.getWorkingHours(this.salonId).subscribe({
      next: (hours: WorkingHours[]) => {
        this.hasHoursSet = hours && hours.length > 0;

        const sortedHours = this.dayValues.map((day) => {
          const found = hours.find((h: WorkingHours) => h.dayOfWeek === day);
          if (found) {
            return {
              ...found,
              openTime: this.formatTimeForInput(found.openTime),
              closeTime: this.formatTimeForInput(found.closeTime),
            };
          }
          return this.createDefaultHours(day);
        });

        this.workingHoursArray.clear();
        sortedHours.forEach((hour) => {
          const group = this.fb.group({
            id: [hour.id || ''],
            dayOfWeek: [hour.dayOfWeek],
            openTime: [{ value: hour.openTime, disabled: hour.isClosed }],
            closeTime: [{ value: hour.closeTime, disabled: hour.isClosed }],
            isClosed: [hour.isClosed],
          });
          this.workingHoursArray.push(group);
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('WorkingHoursSection: Error loading hours:', err);
        this.error = 'Unable to load working hours. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private createDefaultHours(day: WorkingHours['dayOfWeek']): WorkingHours {
    return {
      id: '',
      salonId: this.salonId,
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '18:00',
      isClosed: false,
    };
  }

  private formatTimeForInput(timeString: string): string {
    if (!timeString) return '09:00';
    const parts = timeString.split(':');
    return `${parts[0] || '09'}:${parts[1] || '00'}`;
  }

  formatTimeTo12Hour(timeStr: string): string {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  isFormInvalid(): boolean {
    const array = this.workingHoursArray;
    if (!array || array.length === 0) return false;

    for (let i = 0; i < array.length; i++) {
      const group = array.at(i);
      const isClosed = group.get('isClosed')?.value;
      if (!isClosed) {
        // Use getRawValue or get().value to check values regardless of disabled state
        const openTime = group.get('openTime')?.value;
        const closeTime = group.get('closeTime')?.value;
        if (!openTime || !closeTime) {
          return true;
        }
      }
    }
    return false;
  }

  onClosedChange(index: number): void {
    const group = this.workingHoursArray.at(index);
    const isClosed = group.get('isClosed')?.value;
    const openTimeCtrl = group.get('openTime');
    const closeTimeCtrl = group.get('closeTime');

    if (isClosed) {
      openTimeCtrl?.disable();
      closeTimeCtrl?.disable();
    } else {
      openTimeCtrl?.enable();
      closeTimeCtrl?.enable();
    }
    this.cdr.markForCheck();
  }

  startEditing(): void {
    this.isEditing = true;
    this.cdr.markForCheck();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadWorkingHours(true);
    this.cdr.markForCheck();
  }

  saveChanges(): void {
    if (this.isFormInvalid()) return;

    const hoursData = this.workingHoursArray.getRawValue().map((hour: any) => {
      const formatTimeForBackend = (time: string) => {
        if (!time) return '00:00:00';
        const parts = time.split(':');
        const hours = parts[0] || '00';
        const minutes = parts[1] || '00';
        return `${hours}:${minutes}:00`;
      };

      return {
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.isClosed ? '00:00:00' : formatTimeForBackend(hour.openTime),
        closeTime: hour.isClosed ? '00:00:00' : formatTimeForBackend(hour.closeTime),
        isClosed: hour.isClosed,
      };
    });

    this.saving = true;
    this.cdr.markForCheck();

    this.salonService.updateWorkingHours(this.salonId, hoursData as any).subscribe({
      next: () => {
        this.saving = false;
        this.isEditing = false;
        this.updated.emit();
        this.loadWorkingHours(true);
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('WorkingHoursSection: Error saving hours:', err);
        this.toast.error('Failed to update working hours. Please try again.');
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}

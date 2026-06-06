import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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

  dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  dayValues: WorkingHours['dayOfWeek'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  constructor(
    private fb: FormBuilder,
    private salonService: SalonService,
    private toast: ToastService
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
    }

    this.salonService.getWorkingHours(this.salonId).subscribe({
      next: (hours: WorkingHours[]) => {
        const sortedHours = this.dayValues.map(
          (day) => hours.find((h: WorkingHours) => h.dayOfWeek === day) || this.createDefaultHours(day)
        );

        this.workingHoursArray.clear();
        sortedHours.forEach((hour) => {
          this.workingHoursArray.push(
            this.fb.group({
              id: [hour.id || ''],
              dayOfWeek: [hour.dayOfWeek],
              openTime: [hour.openTime],
              closeTime: [hour.closeTime],
              isClosed: [hour.isClosed],
            })
          );
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('WorkingHoursSection: Error loading hours:', err);
        this.error = 'Unable to load working hours. Please try again.';
        this.loading = false;
      }
    });
  }

  private createDefaultHours(day: WorkingHours['dayOfWeek']): WorkingHours {
    return {
      id: '',
      salonId: this.salonId,
      dayOfWeek: day,
      openTime: '09:00:00',
      closeTime: '18:00:00',
      isClosed: false,
    };
  }

  saveChanges(): void {
    const hoursData = this.workingHoursArray.value.map((hour: any) => {
      const formatTime = (time: string) => {
        if (!time) return '00:00:00';
        const parts = time.split(':');
        const hours = parts[0] || '00';
        const minutes = parts[1] || '00';
        return `${hours}:${minutes}:00`;
      };

      return {
        dayOfWeek: hour.dayOfWeek,
        openTime: hour.isClosed ? '00:00:00' : formatTime(hour.openTime),
        closeTime: hour.isClosed ? '00:00:00' : formatTime(hour.closeTime),
        isClosed: hour.isClosed,
      };
    });

    this.saving = true;

    this.salonService.updateWorkingHours(this.salonId, hoursData).subscribe({
      next: () => {
        this.saving = false;
        this.updated.emit();
        this.loadWorkingHours(true);
      },
      error: (err) => {
        console.error('WorkingHoursSection: Error saving hours:', err);
        this.toast.error('Failed to update working hours. Please try again.');
        this.saving = false;
      }
    });
  }

  toggleClosed(index: number): void {
    const group = this.workingHoursArray.at(index);
    const isClosed = group.get('isClosed')?.value;
    group.patchValue({ isClosed: !isClosed });
  }
}

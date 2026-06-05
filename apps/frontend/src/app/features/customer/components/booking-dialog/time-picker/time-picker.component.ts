import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Salon } from '../../../../../core/models';

@Component({
  selector: 'app-time-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
})
export class TimePickerComponent {
  @Input() salon: Salon | null = null;
  @Input() selectedDateTime = '';
  @Output() dateTimeChange = new EventEmitter<string>();
  @Output() next = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  error: string | null = null;

  onDateTimeChange(value: string) {
    this.error = null;
    if (!value) {
      this.error = 'Please select a date and time';
      return;
    }
    const selected = new Date(value);
    const now = new Date();
    if (selected < now) {
      this.error = 'Please select a future date and time';
      return;
    }

    if (this.salon && this.salon.workingHours) {
      const dayIndex = selected.getDay(); // 0 = Sunday, 1 = Monday...
      const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayName = dayMap[dayIndex];

      const workingHour = this.salon.workingHours.find(h => h.dayOfWeek === dayName);

      if (!workingHour || workingHour.isClosed) {
        this.error = `Salon is closed on ${dayName.charAt(0) + dayName.slice(1).toLowerCase()}`;
        return;
      }

      const timeStr = selected.toTimeString().slice(0, 5); // "HH:mm"
      const openTime = workingHour.openTime.slice(0, 5);
      const closeTime = workingHour.closeTime.slice(0, 5);

      if (timeStr < openTime || timeStr > closeTime) {
        this.error = `Salon is open from ${openTime} to ${closeTime} on ${dayName.charAt(0) + dayName.slice(1).toLowerCase()}`;
        return;
      }
    }

    this.selectedDateTime = value;
    this.dateTimeChange.emit(value);
  }

  onNext() {
    if (!this.selectedDateTime) {
      this.error = 'Please select a date and time';
      return;
    }
    this.next.emit(this.selectedDateTime);
  }

  onBack() {
    this.back.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  getMinDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString().slice(0, 16);
  }
}

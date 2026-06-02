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

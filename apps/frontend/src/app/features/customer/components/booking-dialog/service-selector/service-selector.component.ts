import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Service } from '../../../../../core/models';
import { FormatPricePipe } from '../../../../../shared/pipes/format-price.pipe';
import { FormatDurationPipe } from '../../../../../shared/pipes/format-duration.pipe';

export interface SelectedService {
  service: Service;
  quantity: number;
}

@Component({
  selector: 'app-service-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatPricePipe, FormatDurationPipe],
  templateUrl: './service-selector.component.html',
  styleUrls: ['./service-selector.component.scss'],
})
export class ServiceSelectorComponent {
  @Input() services: Service[] = [];
  @Input() selected: SelectedService[] = [];
  @Output() selectionChange = new EventEmitter<SelectedService[]>();
  @Output() next = new EventEmitter<SelectedService[]>();
  @Output() cancel = new EventEmitter<void>();

  toggleService(service: Service) {
    const idx = this.selected.findIndex((x) => x.service.id === service.id);
    if (idx >= 0) {
      this.selected.splice(idx, 1);
    } else {
      this.selected.push({ service, quantity: 1 });
    }
    this.selectionChange.emit([...this.selected]);
  }

  isSelected(service: Service): boolean {
    return this.selected.some((x) => x.service.id === service.id);
  }

  setQuantity(service: Service, qty: number) {
    const item = this.selected.find((x) => x.service.id === service.id);
    if (item) {
      item.quantity = Math.max(1, Math.min(5, qty));
      this.selectionChange.emit([...this.selected]);
    }
  }

  getTotalPrice(): number {
    return this.selected.reduce((sum, item) => sum + item.service.price * item.quantity, 0);
  }

  getTotalDuration(): number {
    return this.selected.reduce((sum, item) => sum + item.service.durationMinutes * item.quantity, 0);
  }

  getQuantityForService(service: Service): number {
    const item = this.selected.find((s) => s.service.id === service.id);
    return item ? item.quantity : 1;
  }

  onNext() {
    if (this.selected.length === 0) return;
    this.next.emit(this.selected);
  }

  onCancel() {
    this.cancel.emit();
  }
}

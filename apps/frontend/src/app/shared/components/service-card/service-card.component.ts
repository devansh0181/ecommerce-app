import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../core/models';
import { FormatPricePipe } from '../../pipes/format-price.pipe';
import { FormatDurationPipe } from '../../pipes/format-duration.pipe';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule, FormatPricePipe, FormatDurationPipe],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss'],
})
export class ServiceCardComponent {
  @Input() service!: Service;
  @Output() add = new EventEmitter<Service>();

  onAdd() {
    this.add.emit(this.service);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Salon } from '../../../core/models';
import { RatingDisplayComponent } from '../rating-display/rating-display.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-salon-card',
  standalone: true,
  imports: [CommonModule, RatingDisplayComponent, StatusBadgeComponent],
  templateUrl: './salon-card.component.html',
  styleUrls: ['./salon-card.component.scss'],
})
export class SharedSalonCardComponent {
  @Input() salon!: Salon;
  @Output() select = new EventEmitter<Salon>();

  onSelect() {
    this.select.emit(this.salon);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Salon } from '../../../../core/models';

@Component({
  selector: 'app-salon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salon-card.component.html',
  styleUrls: ['./salon-card.component.scss'],
})
export class SalonCardComponent {
  @Input() salon!: Salon;
  @Output() select = new EventEmitter<Salon>();

  onSelect() {
    this.select.emit(this.salon);
  }

  stars(count: number) {
    const full = Math.floor(count);
    const half = count - full >= 0.5;
    return { full, half };
  }

  fullStars(n: number) {
    const full = Math.max(0, Math.floor(n || 0));
    return Array.from({ length: full });
  }
}

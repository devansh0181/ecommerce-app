import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-display.component.html',
  styleUrls: ['./rating-display.component.scss'],
})
export class RatingDisplayComponent {
  @Input() rating = 0;
  @Input() count?: number;

  starsArray() {
    return Array.from({ length: 5 });
  }
  filled(i: number) {
    return i < Math.floor(this.rating || 0);
  }
}

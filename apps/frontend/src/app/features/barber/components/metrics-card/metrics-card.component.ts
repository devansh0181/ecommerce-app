import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss'],
})
export class MetricsCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() trend: 'up' | 'down' | null = null;
  @Input() icon = '';
}

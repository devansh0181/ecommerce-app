import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-queue-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queue-summary.component.html',
  styleUrls: ['./queue-summary.component.scss'],
})
export class QueueSummaryComponent {
  @Input() total = 0;
  @Input() estimatedMinutes = 0;
  @Input() averageMinutes = 0;

  get estimatedLabel(): string {
    const hours = Math.floor(this.estimatedMinutes / 60);
    const minutes = this.estimatedMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  get averageLabel(): string {
    return `${this.averageMinutes}m`;
  }
}

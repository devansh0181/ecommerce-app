import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineStep {
  label: string;
  timestamp?: string | Date;
  state: 'completed' | 'current' | 'pending';
}

@Component({
  selector: 'app-status-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-timeline.component.html',
  styleUrls: ['./status-timeline.component.scss'],
})
export class StatusTimelineComponent {
  @Input() steps: TimelineStep[] = [];
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-timeline.component.html',
  styleUrls: ['./schedule-timeline.component.scss'],
})
export class ScheduleTimelineComponent {
  @Input() items: Array<{ time: string; customer: string; service: string }> = [];
}

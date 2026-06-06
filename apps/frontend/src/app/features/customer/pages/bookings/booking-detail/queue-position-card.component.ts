import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueuePosition } from '../../../../../core/models';
import { QueueService } from '../../../../../core/services/queue.service';

@Component({
  selector: 'app-queue-position-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './queue-position-card.component.html',
  styleUrls: ['./queue-position-card.component.scss'],
})
export class QueuePositionCardComponent {
  @Input() queuePosition: QueuePosition | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() lastUpdate: Date | null = null;
  @Input() autoRefresh = true;

  @Output() refresh = new EventEmitter<void>();
  @Output() toggleAutoRefresh = new EventEmitter<boolean>();

  constructor(private queueService: QueueService) {}

  get waitText(): string {
    if (!this.queuePosition) {
      return 'Position loading...';
    }
    return this.queueService.formatWaitTime(this.queuePosition.estimatedWaitTimeMinutes);
  }

  get statusCaption(): string {
    if (!this.queuePosition) {
      return 'Loading your queue position.';
    }
    if (this.queuePosition.position === 1) {
      return 'You are next in line.';
    }
    return `You are #${this.queuePosition.position} in queue.`;
  }

  get lastUpdatedLabel(): string {
    if (!this.lastUpdate) return 'Not updated yet';
    const seconds = Math.floor((new Date().getTime() - this.lastUpdate.getTime()) / 1000);
    if (seconds < 60) {
      return `${seconds}s ago`;
    }
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onToggle(): void {
    this.toggleAutoRefresh.emit(!this.autoRefresh);
  }
}

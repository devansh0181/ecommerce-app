import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, of, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { QueueService } from '../../../../core/services/queue.service';
import { QueuePosition } from '../../../../core/models';
import { QueueMessagePipe } from '../../../../shared/pipes/queue-message.pipe';

@Component({
  selector: 'app-queue-position-card',
  standalone: true,
  imports: [CommonModule, QueueMessagePipe],
  templateUrl: './queue-position-card.component.html',
  styleUrls: ['./queue-position-card.component.scss'],
})
export class QueuePositionCardComponent implements OnChanges, OnDestroy {
  @Input() bookingId = '';
  @Input() autoRefreshInterval = 30000;
  @Input() autoRefresh = true;

  queuePosition: QueuePosition | null = null;
  loading = false;
  error: string | null = null;
  lastUpdatedAt: Date | null = null;

  private refreshSubscription?: Subscription;
  private autoRefreshSubscription?: Subscription;

  constructor(private queueService: QueueService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookingId'] && this.bookingId) {
      this.loadQueuePosition();
      this.initializeAutoRefresh();
    }

    if (changes['autoRefresh'] && !changes['bookingId']) {
      this.initializeAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.autoRefreshSubscription?.unsubscribe();
  }

  get positionLabel(): string {
    if (!this.queuePosition) return 'Loading queue position...';
    if (this.queuePosition.position === 0) return 'Waiting for barber to start!';
    if (this.queuePosition.position === 1) return "You're next!";
    return `You are #${this.queuePosition.position} in queue`;
  }

  get completionState(): boolean {
    return this.queuePosition?.position === 0;
  }

  get lastUpdatedLabel(): string {
    if (!this.lastUpdatedAt) return 'Not updated yet';
    const seconds = Math.floor((Date.now() - this.lastUpdatedAt.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  }

  onRefresh(): void {
    this.loadQueuePosition(true);
  }

  onToggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    this.initializeAutoRefresh();
  }

  private loadQueuePosition(force = false): void {
    if (!this.bookingId) {
      this.error = 'Booking ID is missing.';
      return;
    }

    if (this.loading && !force) {
      return;
    }

    this.refreshSubscription?.unsubscribe();
    this.loading = true;
    this.error = null;

    this.refreshSubscription = this.queueService
      .getQueuePosition(this.bookingId)
      .pipe(
        catchError((err: any) => {
          console.error('Queue position fetch failed', err);
          this.error = 'Failed to load queue status. Please try again.';
          return of(null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((result) => {
        this.queuePosition = result || null;
        if (result) {
          this.lastUpdatedAt = new Date();
        }
        this.cdr.markForCheck();
      });
  }

  private initializeAutoRefresh(): void {
    this.autoRefreshSubscription?.unsubscribe();
    if (!this.autoRefresh || !this.bookingId) return;

    this.autoRefreshSubscription = interval(this.autoRefreshInterval).subscribe(() => {
      this.loadQueuePosition(true);
    });
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { QueuePosition } from '../../core/models';

@Pipe({ name: 'queueMessage', pure: true, standalone: true })
export class QueueMessagePipe implements PipeTransform {
  transform(queuePosition: QueuePosition | null | undefined): string {
    if (!queuePosition) {
      return 'Loading queue position...';
    }

    if (queuePosition.position === 0) {
      return "Waiting for barber to start!";
    }

    if (queuePosition.position === 1) {
      return "You're next!";
    }

    return `You are #${queuePosition.position} in queue`;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatDuration', pure: true, standalone: true })
export class FormatDurationPipe implements PipeTransform {
  transform(minutes: number | string | null | undefined): string {
    if (minutes === null || minutes === undefined || minutes === '') return '';
    const mins = Number(minutes);
    if (isNaN(mins) || mins <= 0) return '0 min';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    if (rem === 0) return hours === 1 ? `${hours} hour` : `${hours} hours`;
    return `${hours}h ${rem}min`;
  }
}

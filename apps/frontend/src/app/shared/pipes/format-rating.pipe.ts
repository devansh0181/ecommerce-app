import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatRating', pure: true, standalone: true })
export class FormatRatingPipe implements PipeTransform {
  transform(value: number | string | null | undefined, mode: 'long' | 'short' = 'long'): string {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    if (isNaN(n)) return '';
    if (mode === 'short') return `${n.toFixed(1)}★`;
    return `${n.toFixed(1)} / 5`;
  }
}

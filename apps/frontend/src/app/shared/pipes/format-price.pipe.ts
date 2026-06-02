import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatPrice', pure: true, standalone: true })
export class FormatPricePipe implements PipeTransform {
  transform(value: number | string | null | undefined, currency: string = 'USD'): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    const curr = currency === 'EUR' ? 'EUR' : 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: curr }).format(num);
    } catch (e) {
      return `${curr} ${num.toFixed(2)}`;
    }
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inr', standalone: true })
export class InrCurrencyPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return this.formatter.format(Number(value));
  }
}

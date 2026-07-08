import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stepper">
      <button type="button" (click)="dec()" [disabled]="value() <= min()" aria-label="Decrease quantity">−</button>
      <span class="value">{{ value() }}</span>
      <button type="button" (click)="inc()" [disabled]="value() >= max()" aria-label="Increase quantity">+</button>
    </div>
  `,
  styles: [
    `
      .stepper {
        display: inline-flex;
        align-items: center;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        overflow: hidden;
      }
      button {
        width: 34px;
        height: 34px;
        border: none;
        background: var(--bg-muted);
        color: var(--text-primary);
        font-size: 1.1rem;
        cursor: pointer;
      }
      button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .value {
        min-width: 36px;
        text-align: center;
        font-weight: 600;
      }
    `,
  ],
})
export class QuantityStepperComponent {
  value = input(1);
  min = input(1);
  max = input(20);
  changed = output<number>();

  inc(): void {
    if (this.value() < this.max()) this.changed.emit(this.value() + 1);
  }

  dec(): void {
    if (this.value() > this.min()) this.changed.emit(this.value() - 1);
  }
}

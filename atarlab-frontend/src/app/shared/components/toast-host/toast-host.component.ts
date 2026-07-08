import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-host" role="status" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <button type="button" class="toast" [class]="toast.type" (click)="toastService.dismiss(toast.id)">
          {{ toast.message }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .toast-host {
        position: fixed;
        bottom: var(--space-6);
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        align-items: center;
        width: max-content;
        max-width: 90vw;
      }
      .toast {
        display: block;
        font-family: inherit;
        text-align: left;
        padding: 12px 20px;
        border-radius: var(--radius-md);
        background: var(--bg-elevated);
        color: var(--text-primary);
        box-shadow: var(--shadow-md);
        cursor: pointer;
        font-size: 0.9rem;
        border: 1px solid var(--border);
      }
      .toast.success {
        border-color: var(--success);
      }
      .toast.error {
        border-color: var(--danger);
      }
    `,
  ],
})
export class ToastHostComponent {
  toastService = inject(ToastService);
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reset-password.component.html',
  styleUrl: '../auth-shared.scss',
})
export class ResetPasswordComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  newPassword = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error.set('Missing or invalid reset token');
      return;
    }
    this.submitting.set(true);
    try {
      await firstValueFrom(this.authApi.resetPassword(token, this.newPassword()));
      this.toast.success('Password reset successfully. Please sign in.');
      this.router.navigate(['/auth/login']);
    } catch {
      this.error.set('This reset link is invalid or has expired.');
    } finally {
      this.submitting.set(false);
    }
  }
}

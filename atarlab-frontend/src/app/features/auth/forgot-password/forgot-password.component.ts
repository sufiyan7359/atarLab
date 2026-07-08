import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.component.html',
  styleUrl: '../auth-shared.scss',
})
export class ForgotPasswordComponent {
  private readonly authApi = inject(AuthApiService);

  email = signal('');
  submitting = signal(false);
  sent = signal(false);

  async submit(): Promise<void> {
    this.submitting.set(true);
    try {
      await firstValueFrom(this.authApi.forgotPassword(this.email()));
      this.sent.set(true);
    } finally {
      this.submitting.set(false);
    }
  }
}

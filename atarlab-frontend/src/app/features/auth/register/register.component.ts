import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: '../auth-shared.scss',
})
export class RegisterComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  fullName = signal('');
  email = signal('');
  password = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    if (this.password().length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }
    this.submitting.set(true);
    try {
      await firstValueFrom(
        this.authApi.register({ fullName: this.fullName(), email: this.email(), password: this.password() }),
      );
      this.toast.success('Account created! Please sign in.');
      this.router.navigate(['/auth/login']);
    } catch (err) {
      const message = (err as { error?: { error?: { message?: string } } })?.error?.error?.message;
      this.error.set(message ?? 'Something went wrong. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}

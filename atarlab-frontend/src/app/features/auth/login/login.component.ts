import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../../core/services/auth-api.service';
import { AuthStore } from '../../../core/state/auth.store';
import { CartStore } from '../../../core/state/cart.store';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: '../auth-shared.scss',
})
export class LoginComponent {
  private readonly authApi = inject(AuthApiService);
  private readonly authStore = inject(AuthStore);
  private readonly cartStore = inject(CartStore);
  private readonly sessionService = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  identifier = signal('');
  password = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    this.submitting.set(true);
    try {
      const sessionId = this.sessionService.getSessionId();
      const res = await firstValueFrom(
        this.authApi.login({ identifier: this.identifier(), password: this.password() }),
      );
      this.authStore.setSession(res.data.accessToken, res.data.user);
      await this.cartStore.mergeGuestCart(sessionId);
      this.toast.success(`Welcome back, ${res.data.user.fullName}!`);
      const redirect = this.route.snapshot.queryParamMap.get('redirect') ?? '/';
      this.router.navigateByUrl(redirect);
    } catch {
      this.error.set('Invalid email/phone or password');
    } finally {
      this.submitting.set(false);
    }
  }
}

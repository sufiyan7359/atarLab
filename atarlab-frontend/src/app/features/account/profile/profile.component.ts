import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../../core/state/auth.store';
import { UsersApiService } from '../../../core/services/users-api.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile.component.html',
  styleUrl: '../orders/account-shared.scss',
})
export class ProfileComponent {
  authStore = inject(AuthStore);
  private readonly usersApi = inject(UsersApiService);
  private readonly toast = inject(ToastService);

  fullName = signal(this.authStore.user()?.fullName ?? '');
  currentPassword = signal('');
  newPassword = signal('');
  savingProfile = signal(false);
  savingPassword = signal(false);

  async saveProfile(): Promise<void> {
    this.savingProfile.set(true);
    try {
      const res = await firstValueFrom(this.usersApi.updateProfile({ fullName: this.fullName() }));
      this.authStore.updateUser(res.data);
      this.toast.success('Profile updated');
    } finally {
      this.savingProfile.set(false);
    }
  }

  async changePassword(): Promise<void> {
    this.savingPassword.set(true);
    try {
      await firstValueFrom(
        this.usersApi.changePassword({ currentPassword: this.currentPassword(), newPassword: this.newPassword() }),
      );
      this.toast.success('Password changed successfully');
      this.currentPassword.set('');
      this.newPassword.set('');
    } catch {
      this.toast.error('Current password is incorrect');
    } finally {
      this.savingPassword.set(false);
    }
  }
}

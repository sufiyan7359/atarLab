import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminSettingsApiService } from '../../../core/services/admin/admin-settings-api.service';
import { SiteSettings } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-settings.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminSettingsComponent implements OnInit {
  private readonly api = inject(AdminSettingsApiService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  settings = signal<SiteSettings | null>(null);
  saving = signal(false);
  // Plain (non-signal) object so [(ngModel)] can two-way-bind into its individual fields —
  // under OnPush this needs an explicit markForCheck() after it's populated asynchronously,
  // since mutating a plain property doesn't itself notify the OnPush change-detection guard.
  form: SiteSettings | null = null;

  async ngOnInit(): Promise<void> {
    const res = await firstValueFrom(this.api.get());
    this.settings.set(res.data);
    this.form = { ...res.data };
    this.cdr.markForCheck();
  }

  async save(): Promise<void> {
    if (!this.form) return;
    this.saving.set(true);
    try {
      const res = await firstValueFrom(this.api.update(this.form));
      this.settings.set(res.data);
      this.toast.success('Settings saved');
    } finally {
      this.saving.set(false);
    }
  }
}

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminBannersApiService, BannerPayload } from '../../../core/services/admin/admin-banners-api.service';
import { UploadsApiService } from '../../../core/services/admin/uploads-api.service';
import { Banner } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';

const EMPTY: BannerPayload = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  position: 'HERO',
  sortOrder: 0,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

@Component({
  selector: 'app-admin-banner-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-banner-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminBannerListComponent implements OnInit {
  private readonly api = inject(AdminBannersApiService);
  private readonly uploadsApi = inject(UploadsApiService);
  private readonly toast = inject(ToastService);

  banners = signal<Banner[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  uploading = signal(false);
  form: BannerPayload = { ...EMPTY };

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const res = await firstValueFrom(this.api.list());
    this.banners.set(res.data);
  }

  startCreate(): void {
    this.form = { ...EMPTY };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(banner: Banner): void {
    const { title, imageUrl, linkUrl, position, sortOrder, startsAt, endsAt, isActive } = banner;
    this.form = { title, imageUrl, linkUrl, position, sortOrder, startsAt, endsAt, isActive };
    this.editingId.set(banner.id);
    this.showForm.set(true);
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    try {
      const res = await firstValueFrom(this.uploadsApi.uploadImage(file));
      this.form.imageUrl = res.data.url;
    } finally {
      this.uploading.set(false);
      input.value = '';
    }
  }

  async save(): Promise<void> {
    if (this.editingId()) {
      await firstValueFrom(this.api.update(this.editingId()!, this.form));
      this.toast.success('Banner updated');
    } else {
      await firstValueFrom(this.api.create(this.form));
      this.toast.success('Banner created');
    }
    this.showForm.set(false);
    await this.load();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.remove(id));
    this.toast.success('Banner deleted');
    await this.load();
  }
}

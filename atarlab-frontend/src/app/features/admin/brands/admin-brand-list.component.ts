import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminBrandsApiService, BrandPayload } from '../../../core/services/admin/admin-brands-api.service';
import { Brand } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';

const EMPTY: BrandPayload = { name: '', slug: '', logoUrl: '', description: '', isActive: true };

@Component({
  selector: 'app-admin-brand-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-brand-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminBrandListComponent implements OnInit {
  private readonly api = inject(AdminBrandsApiService);
  private readonly toast = inject(ToastService);

  brands = signal<Brand[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: BrandPayload = { ...EMPTY };

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const res = await firstValueFrom(this.api.list());
    this.brands.set(res.data);
  }

  startCreate(): void {
    this.form = { ...EMPTY };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(brand: Brand): void {
    this.form = { name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl ?? '', isActive: true };
    this.editingId.set(brand.id);
    this.showForm.set(true);
  }

  async save(): Promise<void> {
    if (this.editingId()) {
      await firstValueFrom(this.api.update(this.editingId()!, this.form));
      this.toast.success('Brand updated');
    } else {
      await firstValueFrom(this.api.create(this.form));
      this.toast.success('Brand created');
    }
    this.showForm.set(false);
    await this.load();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.remove(id));
    this.toast.success('Brand deleted');
    await this.load();
  }
}

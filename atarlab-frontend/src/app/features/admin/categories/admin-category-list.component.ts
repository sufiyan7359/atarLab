import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminCategoriesApiService, CategoryPayload } from '../../../core/services/admin/admin-categories-api.service';
import { Category } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';

const EMPTY: CategoryPayload = { name: '', slug: '', imageUrl: '', sortOrder: 0, isActive: true };

@Component({
  selector: 'app-admin-category-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-category-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminCategoryListComponent implements OnInit {
  private readonly api = inject(AdminCategoriesApiService);
  private readonly toast = inject(ToastService);

  categories = signal<Category[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: CategoryPayload = { ...EMPTY };

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const res = await firstValueFrom(this.api.list());
    this.categories.set(res.data);
  }

  startCreate(): void {
    this.form = { ...EMPTY };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(category: Category): void {
    this.form = {
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl ?? '',
      sortOrder: 0,
      isActive: true,
    };
    this.editingId.set(category.id);
    this.showForm.set(true);
  }

  async save(): Promise<void> {
    if (this.editingId()) {
      await firstValueFrom(this.api.update(this.editingId()!, this.form));
      this.toast.success('Category updated');
    } else {
      await firstValueFrom(this.api.create(this.form));
      this.toast.success('Category created');
    }
    this.showForm.set(false);
    await this.load();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.remove(id));
    this.toast.success('Category deleted');
    await this.load();
  }
}

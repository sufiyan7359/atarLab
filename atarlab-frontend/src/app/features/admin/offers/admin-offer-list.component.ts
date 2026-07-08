import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminOffersApiService, OfferPayload } from '../../../core/services/admin/admin-offers-api.service';
import { AdminCategoriesApiService } from '../../../core/services/admin/admin-categories-api.service';
import { AdminBrandsApiService } from '../../../core/services/admin/admin-brands-api.service';
import { Offer } from '../../../core/models/admin.model';
import { Category, Brand } from '../../../core/models/product.model';
import { ToastService } from '../../../shared/services/toast.service';

const EMPTY: OfferPayload = {
  title: '',
  description: '',
  bannerImage: '',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  categoryId: null,
  brandId: null,
  productId: null,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

@Component({
  selector: 'app-admin-offer-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-offer-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminOfferListComponent implements OnInit {
  private readonly api = inject(AdminOffersApiService);
  private readonly categoriesApi = inject(AdminCategoriesApiService);
  private readonly brandsApi = inject(AdminBrandsApiService);
  private readonly toast = inject(ToastService);

  offers = signal<Offer[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: OfferPayload = { ...EMPTY };

  async ngOnInit(): Promise<void> {
    const [offersRes, categoriesRes, brandsRes] = await Promise.all([
      firstValueFrom(this.api.list()),
      firstValueFrom(this.categoriesApi.list()),
      firstValueFrom(this.brandsApi.list()),
    ]);
    this.offers.set(offersRes.data);
    this.categories.set(categoriesRes.data);
    this.brands.set(brandsRes.data);
  }

  private async reload(): Promise<void> {
    const res = await firstValueFrom(this.api.list());
    this.offers.set(res.data);
  }

  startCreate(): void {
    this.form = { ...EMPTY };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(offer: Offer): void {
    this.form = { ...offer };
    this.editingId.set(offer.id);
    this.showForm.set(true);
  }

  async save(): Promise<void> {
    if (this.editingId()) {
      await firstValueFrom(this.api.update(this.editingId()!, this.form));
      this.toast.success('Offer updated');
    } else {
      await firstValueFrom(this.api.create(this.form));
      this.toast.success('Offer created');
    }
    this.showForm.set(false);
    await this.reload();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.remove(id));
    this.toast.success('Offer deleted');
    await this.reload();
  }
}

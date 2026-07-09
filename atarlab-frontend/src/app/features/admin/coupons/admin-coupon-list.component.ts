import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AdminCouponsApiService, CouponPayload } from '../../../core/services/admin/admin-coupons-api.service';
import { Coupon } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';
import { InrCurrencyPipe } from '../../../shared/pipes/inr-currency.pipe';

const EMPTY: CouponPayload = {
  code: '',
  type: 'PERCENTAGE',
  value: 10,
  minOrderValue: 0,
  maxDiscount: null,
  usageLimit: null,
  perUserLimit: 1,
  startsAt: null,
  expiresAt: null,
  isActive: true,
};

@Component({
  selector: 'app-admin-coupon-list',
  standalone: true,
  imports: [FormsModule, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-coupon-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminCouponListComponent implements OnInit {
  private readonly api = inject(AdminCouponsApiService);
  private readonly toast = inject(ToastService);

  coupons = signal<Coupon[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: CouponPayload = { ...EMPTY };

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const res = await firstValueFrom(this.api.list());
    this.coupons.set(res.data);
  }

  startCreate(): void {
    this.form = { ...EMPTY };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(coupon: Coupon): void {
    const { code, type, value, minOrderValue, maxDiscount, usageLimit, perUserLimit, startsAt, expiresAt, isActive } =
      coupon;
    this.form = { code, type, value, minOrderValue, maxDiscount, usageLimit, perUserLimit, startsAt, expiresAt, isActive };
    this.editingId.set(coupon.id);
    this.showForm.set(true);
  }

  async save(): Promise<void> {
    if (this.editingId()) {
      await firstValueFrom(this.api.update(this.editingId()!, this.form));
      this.toast.success('Coupon updated');
    } else {
      await firstValueFrom(this.api.create(this.form));
      this.toast.success('Coupon created');
    }
    this.showForm.set(false);
    await this.load();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.api.remove(id));
    this.toast.success('Coupon deleted');
    await this.load();
  }
}

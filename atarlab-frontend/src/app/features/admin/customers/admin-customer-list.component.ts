import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AdminCustomersApiService } from '../../../core/services/admin/admin-customers-api.service';
import { AdminCustomer } from '../../../core/models/admin.model';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-customer-list',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-customer-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminCustomerListComponent implements OnInit {
  private readonly api = inject(AdminCustomersApiService);
  private readonly toast = inject(ToastService);

  customers = signal<AdminCustomer[]>([]);
  loading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.api.list());
      this.customers.set(res.data);
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(customer: AdminCustomer): Promise<void> {
    await firstValueFrom(this.api.setStatus(customer.id, !customer.isActive));
    this.toast.success(customer.isActive ? 'Customer disabled' : 'Customer re-enabled');
    await this.load();
  }

  roleNames(customer: AdminCustomer): string {
    return customer.roles.map((r) => r.name).join(', ') || 'CUSTOMER';
  }
}

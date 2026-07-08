import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  AdminDeliveryAgentsApiService,
  DeliveryAgentPayload,
} from '../../../core/services/admin/admin-delivery-agents-api.service';
import { DeliveryAgent } from '../../../core/models/tracking.model';
import { ToastService } from '../../../shared/services/toast.service';

const EMPTY: DeliveryAgentPayload = { name: '', phone: '', vehicleNumber: '', isActive: true };

@Component({
  selector: 'app-admin-delivery-agent-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-delivery-agent-list.component.html',
  styleUrl: '../admin-shared.scss',
})
export class AdminDeliveryAgentListComponent implements OnInit {
  private readonly api = inject(AdminDeliveryAgentsApiService);
  private readonly toast = inject(ToastService);

  agents = signal<DeliveryAgent[]>([]);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  form: DeliveryAgentPayload = { ...EMPTY };

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const res = await firstValueFrom(this.api.list());
    this.agents.set(res.data);
  }

  startCreate(): void {
    this.form = { ...EMPTY };
    this.editingId.set(null);
    this.showForm.set(true);
  }

  startEdit(agent: DeliveryAgent): void {
    this.form = { name: agent.name, phone: agent.phone, vehicleNumber: agent.vehicleNumber ?? '', isActive: agent.isActive };
    this.editingId.set(agent.id);
    this.showForm.set(true);
  }

  async save(): Promise<void> {
    if (this.editingId()) {
      await firstValueFrom(this.api.update(this.editingId()!, this.form));
      this.toast.success('Delivery agent updated');
    } else {
      await firstValueFrom(this.api.create(this.form));
      this.toast.success('Delivery agent added');
    }
    this.showForm.set(false);
    await this.load();
  }

  async toggleActive(agent: DeliveryAgent): Promise<void> {
    await firstValueFrom(this.api.update(agent.id, { isActive: !agent.isActive }));
    await this.load();
  }
}

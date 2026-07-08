import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AddressesApiService } from '../../../core/services/addresses-api.service';
import { Address, CreateAddressPayload } from '../../../core/models/address.model';
import { ToastService } from '../../../shared/services/toast.service';

const EMPTY_ADDRESS: CreateAddressPayload = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
};

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './address-list.component.html',
  styleUrl: '../orders/account-shared.scss',
})
export class AddressListComponent implements OnInit {
  private readonly addressesApi = inject(AddressesApiService);
  private readonly toast = inject(ToastService);

  addresses = signal<Address[]>([]);
  showForm = signal(false);
  form: CreateAddressPayload = { ...EMPTY_ADDRESS };

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const res = await firstValueFrom(this.addressesApi.list());
    this.addresses.set(res.data);
  }

  async save(): Promise<void> {
    await firstValueFrom(this.addressesApi.create(this.form));
    this.toast.success('Address saved');
    this.form = { ...EMPTY_ADDRESS };
    this.showForm.set(false);
    await this.load();
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.addressesApi.remove(id));
    await this.load();
  }

  async setDefault(id: string): Promise<void> {
    await firstValueFrom(this.addressesApi.setDefault(id));
    await this.load();
  }
}

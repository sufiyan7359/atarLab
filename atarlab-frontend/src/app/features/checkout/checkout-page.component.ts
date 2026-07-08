import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartStore } from '../../core/state/cart.store';
import { AddressesApiService } from '../../core/services/addresses-api.service';
import { OrdersApiService } from '../../core/services/orders-api.service';
import { Address, CreateAddressPayload } from '../../core/models/address.model';
import { ToastService } from '../../shared/services/toast.service';
import { InrCurrencyPipe } from '../../shared/pipes/inr-currency.pipe';
import { RazorpayCheckoutService } from './razorpay-checkout.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [FormsModule, InrCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss',
})
export class CheckoutPageComponent implements OnInit {
  cartStore = inject(CartStore);
  private readonly addressesApi = inject(AddressesApiService);
  private readonly ordersApi = inject(OrdersApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly razorpay = inject(RazorpayCheckoutService);

  addresses = signal<Address[]>([]);
  selectedAddressId = signal<string | null>(null);
  paymentMethod = signal<'COD' | 'RAZORPAY'>('COD');
  showNewAddressForm = signal(false);
  placing = signal(false);

  newAddress: CreateAddressPayload = {
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IN',
  };

  async ngOnInit(): Promise<void> {
    await this.cartStore.refresh();
    const res = await firstValueFrom(this.addressesApi.list());
    this.addresses.set(res.data);
    const defaultAddress = res.data.find((a) => a.isDefault) ?? res.data[0];
    if (defaultAddress) this.selectedAddressId.set(defaultAddress.id);
    else this.showNewAddressForm.set(true);
  }

  async saveNewAddress(): Promise<void> {
    const res = await firstValueFrom(this.addressesApi.create(this.newAddress));
    this.addresses.update((list) => [...list, res.data]);
    this.selectedAddressId.set(res.data.id);
    this.showNewAddressForm.set(false);
  }

  async placeOrder(): Promise<void> {
    const addressId = this.selectedAddressId();
    if (!addressId) {
      this.toast.error('Please select or add a shipping address');
      return;
    }

    this.placing.set(true);
    try {
      const res = await firstValueFrom(
        this.ordersApi.checkout({ shippingAddressId: addressId, paymentMethod: this.paymentMethod() }),
      );

      if (this.paymentMethod() === 'RAZORPAY' && res.data.razorpay) {
        await this.launchRazorpay(res.data.razorpay, res.data.order.id);
      } else {
        this.cartStore.clearLocal();
        this.router.navigate(['/checkout/success', res.data.order.id]);
      }
    } catch {
      this.toast.error('Could not place your order. Please try again.');
    } finally {
      this.placing.set(false);
    }
  }

  private async launchRazorpay(
    razorpay: { orderId: string; amount: number; currency: string; keyId: string },
    orderId: string,
  ): Promise<void> {
    try {
      const result = await this.razorpay.open({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: 'AtarLab',
        description: 'Order payment',
      });

      await firstValueFrom(
        this.ordersApi.verifyRazorpayPayment({
          orderId,
          razorpayOrderId: result.razorpay_order_id,
          razorpayPaymentId: result.razorpay_payment_id,
          razorpaySignature: result.razorpay_signature,
        }),
      );
      this.cartStore.clearLocal();
      this.router.navigate(['/checkout/success', orderId]);
    } catch {
      this.toast.error('Payment was not completed. Your order is saved — you can retry from Order History.');
      this.router.navigate(['/account/orders', orderId]);
    }
  }
}

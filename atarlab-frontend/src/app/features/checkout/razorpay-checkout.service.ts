import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

const SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

@Injectable({ providedIn: 'root' })
export class RazorpayCheckoutService {
  private readonly platformId = inject(PLATFORM_ID);
  private scriptPromise: Promise<void> | null = null;

  private loadScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.reject(new Error('Razorpay is browser-only'));
    if (window.Razorpay) return Promise.resolve();

    this.scriptPromise ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
      document.body.appendChild(script);
    });
    return this.scriptPromise;
  }

  async open(options: RazorpayOptions): Promise<RazorpaySuccessResponse> {
    await this.loadScript();
    return new Promise((resolve, reject) => {
      const instance = new window.Razorpay!({
        ...options,
        handler: (response: RazorpaySuccessResponse) => resolve(response),
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      });
      instance.open();
    });
  }
}

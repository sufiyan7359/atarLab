export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type CreateAddressPayload = Omit<Address, 'id' | 'isDefault' | 'label' | 'line2'> & {
  isDefault?: boolean;
  label?: string;
  line2?: string;
};

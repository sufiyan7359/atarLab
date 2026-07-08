import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../../../common/enums';

export class CheckoutDto {
  @IsUUID()
  shippingAddressId: string;

  @IsOptional()
  @IsUUID()
  billingAddressId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  giftWrap?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  orderNote?: string;
}

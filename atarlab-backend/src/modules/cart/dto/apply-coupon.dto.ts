import { IsString, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  @MaxLength(30)
  code: string;
}

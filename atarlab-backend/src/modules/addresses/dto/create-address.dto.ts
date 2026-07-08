import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  label?: string;

  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsString()
  @MaxLength(255)
  line1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @IsString()
  @MaxLength(100)
  city: string;

  @IsString()
  @MaxLength(100)
  state: string;

  @IsString()
  @MaxLength(12)
  postalCode: string;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

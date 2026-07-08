import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertDeliveryAgentDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  vehicleNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { BannerPosition } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsString()
  @MaxLength(500)
  imageUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkUrl?: string;

  @IsEnum(BannerPosition)
  position: BannerPosition;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsBoolean, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  giftWrap?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}

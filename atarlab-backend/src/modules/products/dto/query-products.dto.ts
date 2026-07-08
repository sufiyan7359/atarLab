import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Gender, Concentration } from '../../../common/enums';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'bestseller';

export class QueryProductsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string; // slug

  @IsOptional()
  @IsString()
  brand?: string; // slug

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(Concentration)
  concentration?: Concentration;

  @IsOptional()
  @IsString()
  season?: string;

  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  rating?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'rating', 'bestseller'])
  sort?: ProductSort;
}

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Gender, Concentration, NoteType } from '../../../common/enums';

export class CreateVariantDto {
  @IsString()
  @MaxLength(50)
  sku: string;

  @IsInt()
  @Min(1)
  sizeMl: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  weightGrams?: number;
}

export class CreateFragranceNoteDto {
  @IsEnum(NoteType)
  noteType: NoteType;

  @IsString()
  @MaxLength(100)
  name: string;
}

export class CreateProductImageDto {
  @IsString()
  @MaxLength(500)
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  altText?: string;
}

export class CreateProductDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(220)
  slug: string;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(Concentration)
  concentration?: Concentration;

  @IsOptional()
  @IsString()
  longevity?: string;

  @IsOptional()
  @IsString()
  projection?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  season?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occasion?: string[];

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFragranceNoteDto)
  fragranceNotes?: CreateFragranceNoteDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(150, { each: true })
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}

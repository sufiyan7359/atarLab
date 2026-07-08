import { IsBoolean, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertFaqDto {
  @IsString()
  @MaxLength(300)
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertBlogPostDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(220)
  slug: string;

  @IsString()
  @MaxLength(300)
  excerpt: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  authorName?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

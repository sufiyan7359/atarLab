import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ValidateIf((dto: RegisterDto) => !dto.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((dto: RegisterDto) => !dto.email)
  @IsPhoneNumber()
  phone?: string;

  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsString()
  @MinLength(8)
  password: string;
}

import { IsEnum, IsString, Length } from 'class-validator';
import { OtpPurpose } from '../../../common/enums';

export class OtpVerifyDto {
  @IsString()
  identifier: string;

  @IsString()
  @Length(6, 6)
  code: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  fullName?: string; // optional, used when purpose=REGISTER and user doesn't exist yet
}

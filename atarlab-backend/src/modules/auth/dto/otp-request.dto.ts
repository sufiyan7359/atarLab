import { IsEnum, IsString } from 'class-validator';
import { OtpPurpose } from '../../../common/enums';

export class OtpRequestDto {
  @IsString()
  identifier: string;

  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;
}

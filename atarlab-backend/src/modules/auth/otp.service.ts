import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { Otp } from './entities/otp.entity';
import { OtpPurpose } from '../../common/enums';
import { MailService } from '../mail/mail.service';

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    private readonly mailService: MailService,
  ) {}

  async request(identifier: string, purpose: OtpPurpose): Promise<void> {
    const code = randomInt(100000, 999999).toString();
    const codeHash = await argon2.hash(code);
    const otp = this.otpRepo.create({
      identifier,
      codeHash,
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    await this.otpRepo.save(otp);

    if (identifier.includes('@')) {
      await this.mailService.sendOtp(identifier, code, purpose);
    } else {
      // SMS provider (Twilio/MSG91) integration point — log in sandbox mode.
      this.logger.log(`[DEV SMS] OTP for ${identifier} (${purpose}): ${code}`);
    }
  }

  async verify(identifier: string, purpose: OtpPurpose, code: string): Promise<void> {
    const otp = await this.otpRepo.findOne({
      where: { identifier, purpose, consumedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    if (!otp) throw new BadRequestException('No pending OTP for this identifier');
    if (otp.expiresAt < new Date()) throw new BadRequestException('OTP has expired');
    if (otp.attempts >= MAX_ATTEMPTS) throw new BadRequestException('Too many attempts, request a new OTP');

    const valid = await argon2.verify(otp.codeHash, code);
    if (!valid) {
      otp.attempts += 1;
      await this.otpRepo.save(otp);
      throw new BadRequestException('Invalid OTP');
    }

    otp.consumedAt = new Date();
    await this.otpRepo.save(otp);
  }
}

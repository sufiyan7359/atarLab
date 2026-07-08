import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

export interface SiteSettings {
  storeName: string;
  supportEmail: string;
  taxRatePercent: number;
  freeShippingThreshold: number;
  flatShippingFee: number;
  codEnabled: boolean;
  razorpayEnabled: boolean;
}

const DEFAULTS: SiteSettings = {
  storeName: 'AtarLab',
  supportEmail: 'support@atarlab.com',
  taxRatePercent: 5,
  freeShippingThreshold: 999,
  flatShippingFee: 99,
  codEnabled: true,
  razorpayEnabled: true,
};

@Injectable()
export class SettingsService {
  constructor(@InjectRepository(Setting) private readonly repo: Repository<Setting>) {}

  async getAll(): Promise<SiteSettings> {
    const keys = Object.keys(DEFAULTS);
    const rows = await this.repo.find({ where: { key: In(keys) } });
    const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULTS, ...stored };
  }

  async update(dto: UpdateSettingsDto): Promise<SiteSettings> {
    const entries = Object.entries(dto).filter(([, value]) => value !== undefined);
    await Promise.all(
      entries.map(([key, value]) =>
        this.repo.upsert({ key, value }, ['key']),
      ),
    );
    return this.getAll();
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { AppConfig } from '../../config/configuration';
import { UploadPort, UploadResult } from './upload.port';

const LOCAL_UPLOAD_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class CloudinaryProvider implements UploadPort {
  private readonly logger = new Logger(CloudinaryProvider.name);
  private readonly configured: boolean;

  constructor(private readonly configService: ConfigService) {
    const app = this.configService.get<AppConfig>('app')!;
    this.configured = !!(
      app.cloudinary.cloudName &&
      app.cloudinary.apiKey &&
      app.cloudinary.apiSecret
    );
    if (this.configured) {
      cloudinary.config({
        cloud_name: app.cloudinary.cloudName,
        api_key: app.cloudinary.apiKey,
        api_secret: app.cloudinary.apiSecret,
      });
    } else {
      this.logger.warn(
        'Cloudinary credentials not configured — uploads are saved to local disk instead.',
      );
    }
  }

  async uploadImage(file: Buffer, originalName: string): Promise<UploadResult> {
    if (this.configured) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'atarlab', resource_type: 'image' },
          (error, result) => {
            if (error || !result)
              return reject(
                new Error(error?.message ?? 'Cloudinary upload failed'),
              );
            resolve({ url: result.secure_url, publicId: result.public_id });
          },
        );
        stream.end(file);
      });
    }

    await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}${extname(originalName) || '.jpg'}`;
    await writeFile(join(LOCAL_UPLOAD_DIR, filename), file);
    const app = this.configService.get<AppConfig>('app')!;
    return { url: `${app.publicUrl}/uploads/${filename}`, publicId: filename };
  }
}

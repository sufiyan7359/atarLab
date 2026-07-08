import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { UPLOAD_PORT } from './upload.port';

@Module({
  controllers: [UploadsController],
  providers: [{ provide: UPLOAD_PORT, useClass: CloudinaryProvider }],
  exports: [UPLOAD_PORT],
})
export class UploadsModule {}

import {
  BadRequestException,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums';
import { UPLOAD_PORT } from './upload.port';
import type { UploadPort } from './upload.port';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

@ApiTags('Admin: Uploads')
@ApiBearerAuth()
@Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.STAFF)
@Controller('admin/uploads')
export class UploadsController {
  constructor(@Inject(UPLOAD_PORT) private readonly uploadPort: UploadPort) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_SIZE_BYTES } }),
  )
  async uploadImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WEBP, and AVIF images are allowed',
      );
    }
    return this.uploadPort.uploadImage(file.buffer, file.originalname);
  }
}

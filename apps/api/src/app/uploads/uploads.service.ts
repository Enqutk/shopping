import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_BYTES = 5 * 1024 * 1024;

@Injectable()
export class UploadsService {
  private readonly productsDir = join(process.cwd(), 'uploads', 'products');

  saveProductImage(file: Express.Multer.File): string {
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, WebP, or GIF images are allowed',
      );
    }
    if (file.size > MAX_BYTES) {
      throw new BadRequestException('Image must be 5 MB or smaller');
    }

    mkdirSync(this.productsDir, { recursive: true });
    const ext =
      EXT_BY_MIME[file.mimetype] ??
      extname(file.originalname).toLowerCase() ||
      '.jpg';
    const filename = `${randomUUID()}${ext}`;
    writeFileSync(join(this.productsDir, filename), file.buffer);

    return `/api/uploads/products/${filename}`;
  }
}

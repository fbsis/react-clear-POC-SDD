import type { ImageValidationResult } from '@application/monster/ports/ImageValidationResult';
import type { ImageValidator } from '@application/monster/ports/ImageValidator';
import type { UploadedImageContent } from '@application/monster/ports/UploadedImageContent';

const MAXIMUM_IMAGE_BYTES = 10 * 1024 * 1024;

export class BrowserImageValidator implements ImageValidator {
  public async inspect(content: UploadedImageContent): Promise<ImageValidationResult> {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(content.mediaType)) {
      return { valid: false, reason: 'Use uma imagem JPEG, PNG ou WebP.' };
    }
    if (content.sizeBytes <= 0 || content.sizeBytes > MAXIMUM_IMAGE_BYTES) {
      return { valid: false, reason: 'A imagem deve possuir no máximo 10 MB.' };
    }
    if (!this.matchesSignature(content)) {
      return {
        valid: false,
        reason: 'O conteúdo da imagem está corrompido ou não corresponde ao formato.'
      };
    }
    if (!(await this.canDecode(content))) {
      return { valid: false, reason: 'O navegador não conseguiu decodificar esta imagem.' };
    }
    return { valid: true };
  }

  private matchesSignature(content: UploadedImageContent): boolean {
    const bytes = content.bytes;
    if (content.mediaType === 'image/png') {
      return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
    }
    if (content.mediaType === 'image/jpeg') {
      return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    }
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    );
  }

  private async canDecode(content: UploadedImageContent): Promise<boolean> {
    if (typeof createImageBitmap !== 'function') {
      return true;
    }

    try {
      const bitmap = await createImageBitmap(
        new Blob([Uint8Array.from(content.bytes).buffer], { type: content.mediaType })
      );
      bitmap.close();
      return true;
    } catch {
      return false;
    }
  }
}

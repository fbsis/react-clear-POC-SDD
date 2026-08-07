import type { ImageValidationResult } from './ImageValidationResult';
import type { UploadedImageContent } from './UploadedImageContent';

export interface ImageValidator {
  inspect(content: UploadedImageContent): Promise<ImageValidationResult>;
}

import type { UploadedImageContent } from './UploadedImageContent';

export interface PersistedUploadedImageContent extends UploadedImageContent {
  readonly id: string;
}

export interface UploadedImageContent {
  readonly fileName: string;
  readonly mediaType: string;
  readonly sizeBytes: number;
  readonly bytes: Uint8Array;
}

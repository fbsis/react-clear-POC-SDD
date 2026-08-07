export interface ImageAssetRecord {
  readonly id: string;
  readonly blob: Blob;
  readonly fileName: string;
  readonly mediaType: 'image/jpeg' | 'image/png' | 'image/webp';
  readonly sizeBytes: number;
  readonly createdAt: string;
}

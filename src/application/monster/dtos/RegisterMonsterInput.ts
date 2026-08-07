export interface RegisterMonsterInput {
  readonly name: string;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  readonly hp: number;
  readonly image:
    | Readonly<{ kind: 'catalog'; imageId: string }>
    | Readonly<{
        kind: 'upload';
        fileName: string;
        mediaType: string;
        sizeBytes: number;
        bytes: Uint8Array;
      }>;
}

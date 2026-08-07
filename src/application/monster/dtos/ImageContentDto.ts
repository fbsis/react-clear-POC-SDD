export type ImageContentDto =
  | Readonly<{ kind: 'catalog'; src: string; alt: string }>
  | Readonly<{ kind: 'uploaded'; bytes: Uint8Array; mediaType: string; alt: string }>;

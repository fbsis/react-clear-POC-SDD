import type { MonsterImageReader } from '@application/monster/ports/MonsterImageReader';
import type { ImageContentDto } from '@application/monster/dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';
import type { MonsterImageCatalog } from '@application/monster/ports/MonsterImageCatalog';
import type { ReviDatabase } from './ReviDatabase';

export class IndexedDbMonsterImageReader implements MonsterImageReader {
  private readonly database: ReviDatabase;
  private readonly catalog: MonsterImageCatalog;

  public constructor(database: ReviDatabase, catalog: MonsterImageCatalog) {
    this.database = database;
    this.catalog = catalog;
  }

  public async read(reference: MonsterImageReferenceDto): Promise<ImageContentDto> {
    if (reference.kind === 'catalog') {
      const image = await this.catalog.findById(reference.reference);
      if (!image) {
        throw new Error('Catalog image was not found.');
      }
      return { kind: 'catalog', src: image.src, alt: image.alt };
    }

    const asset = await (await this.database.open()).get('imageAssets', reference.reference);
    if (!asset) {
      throw new Error('Uploaded image was not found.');
    }
    return {
      kind: 'uploaded',
      bytes: await this.readBytes(asset.blob),
      mediaType: asset.mediaType,
      alt: `Imagem enviada: ${asset.fileName}`
    };
  }

  private async readBytes(blob: Blob): Promise<Uint8Array> {
    if (typeof blob.arrayBuffer === 'function') {
      return new Uint8Array(await blob.arrayBuffer());
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reject(reader.error ?? new Error('Uploaded image could not be read.'));
      };
      reader.onload = () => {
        if (!(reader.result instanceof ArrayBuffer)) {
          reject(new Error('Uploaded image returned an unexpected binary format.'));
          return;
        }
        resolve(new Uint8Array(reader.result));
      };
      reader.readAsArrayBuffer(blob);
    });
  }
}

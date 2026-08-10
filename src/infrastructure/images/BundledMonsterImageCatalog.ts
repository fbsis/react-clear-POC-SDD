import type { CatalogImage } from '@application/monster/ports/CatalogImage';
import type { MonsterImageCatalog } from '@application/monster/ports/MonsterImageCatalog';
import type { BundledCatalogRecord } from './BundledCatalogRecord';
import { validateBundledCatalogRecords } from './validateBundledCatalogRecords';

export class BundledMonsterImageCatalog implements MonsterImageCatalog {
  private records: Promise<readonly BundledCatalogRecord[]> | null = null;
  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async list(): Promise<readonly CatalogImage[]> {
    const records = await this.load();
    return records.map((record) => ({
      id: record.id,
      name: record.name,
      src: `${this.baseUrl}monster-catalog/${record.file}`,
      alt: record.alt
    }));
  }

  public async findById(id: string): Promise<CatalogImage | null> {
    return (await this.list()).find((image) => image.id === id) ?? null;
  }

  private load(): Promise<readonly BundledCatalogRecord[]> {
    if (!this.records) {
      const request = fetch(`${this.baseUrl}monster-catalog/catalog.json`).then(
        async (response) => {
          if (!response.ok) {
            throw new Error('Monster catalog could not be loaded.');
          }
          return validateBundledCatalogRecords(await response.json());
        }
      );
      const retryableRequest = request.catch((error: unknown) => {
        if (this.records === retryableRequest) {
          this.records = null;
        }
        throw error;
      });
      this.records = retryableRequest;
    }
    return this.records;
  }
}

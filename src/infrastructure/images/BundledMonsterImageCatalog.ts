import type { CatalogImage } from '@application/monster/ports/CatalogImage';
import type { MonsterImageCatalog } from '@application/monster/ports/MonsterImageCatalog';
import type { BundledCatalogRecord } from './BundledCatalogRecord';

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
    this.records ??= fetch(`${this.baseUrl}monster-catalog/catalog.json`).then(async (response) => {
      if (!response.ok) {
        throw new Error('Monster catalog could not be loaded.');
      }
      return (await response.json()) as readonly BundledCatalogRecord[];
    });
    return this.records;
  }
}

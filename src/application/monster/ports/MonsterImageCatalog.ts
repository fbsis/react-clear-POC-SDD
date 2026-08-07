import type { CatalogImage } from './CatalogImage';

export interface MonsterImageCatalog {
  list(): Promise<readonly CatalogImage[]>;
  findById(id: string): Promise<CatalogImage | null>;
}

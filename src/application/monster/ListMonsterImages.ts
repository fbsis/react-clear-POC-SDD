import type { ListMonsterImagesUseCase } from './contracts/ListMonsterImagesUseCase';
import type { CatalogImageDto } from './dtos/CatalogImageDto';
import type { MonsterImageCatalog } from './ports/MonsterImageCatalog';

export class ListMonsterImages implements ListMonsterImagesUseCase {
  private readonly catalog: MonsterImageCatalog;

  public constructor(catalog: MonsterImageCatalog) {
    this.catalog = catalog;
  }

  public async execute(): Promise<readonly CatalogImageDto[]> {
    return this.catalog.list();
  }
}

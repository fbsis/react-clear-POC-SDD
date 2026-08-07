import type { CatalogImageDto } from '../dtos/CatalogImageDto';

export interface ListMonsterImagesUseCase {
  execute(): Promise<readonly CatalogImageDto[]>;
}

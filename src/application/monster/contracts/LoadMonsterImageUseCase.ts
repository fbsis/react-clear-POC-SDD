import type { ImageContentDto } from '../dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from '../dtos/MonsterImageReferenceDto';

export interface LoadMonsterImageUseCase {
  execute(reference: MonsterImageReferenceDto): Promise<ImageContentDto>;
}

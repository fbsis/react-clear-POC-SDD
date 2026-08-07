import type { ImageContentDto } from '../dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from '../dtos/MonsterImageReferenceDto';

export interface MonsterImageReader {
  read(reference: MonsterImageReferenceDto): Promise<ImageContentDto>;
}

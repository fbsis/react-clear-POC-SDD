import type { LoadMonsterImageUseCase } from './contracts/LoadMonsterImageUseCase';
import type { ImageContentDto } from './dtos/ImageContentDto';
import type { MonsterImageReferenceDto } from './dtos/MonsterImageReferenceDto';
import type { MonsterImageReader } from './ports/MonsterImageReader';

export class LoadMonsterImage implements LoadMonsterImageUseCase {
  private readonly reader: MonsterImageReader;

  public constructor(reader: MonsterImageReader) {
    this.reader = reader;
  }

  public execute(reference: MonsterImageReferenceDto): Promise<ImageContentDto> {
    return this.reader.read(reference);
  }
}

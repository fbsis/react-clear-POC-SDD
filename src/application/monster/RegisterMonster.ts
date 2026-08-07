import { ApplicationError } from '@application/shared/errors/ApplicationError';
import type { IdGenerator } from '@application/shared/ports/IdGenerator';
import { Monster } from '@domains/monster/Monster';
import { MonsterId } from '@domains/monster/MonsterId';
import { MonsterImageRef } from '@domains/monster/MonsterImageRef';
import type { RegisterMonsterUseCase } from './contracts/RegisterMonsterUseCase';
import type { MonsterDto } from './dtos/MonsterDto';
import type { RegisterMonsterInput } from './dtos/RegisterMonsterInput';
import { mapMonsterToDto } from './mapMonsterToDto';
import type { ImageValidator } from './ports/ImageValidator';
import type { MonsterRepository } from './ports/MonsterRepository';
import type { PersistedUploadedImageContent } from './ports/PersistedUploadedImageContent';

export class RegisterMonster implements RegisterMonsterUseCase {
  private readonly repository: MonsterRepository;
  private readonly idGenerator: IdGenerator;
  private readonly imageValidator: ImageValidator;

  public constructor(
    repository: MonsterRepository,
    idGenerator: IdGenerator,
    imageValidator: ImageValidator
  ) {
    this.repository = repository;
    this.idGenerator = idGenerator;
    this.imageValidator = imageValidator;
  }

  public async execute(input: RegisterMonsterInput): Promise<MonsterDto> {
    const monsterId = MonsterId.create(this.idGenerator.next());
    const upload =
      input.image.kind === 'upload'
        ? await this.validateUpload(monsterId.value, input.image)
        : undefined;
    const image =
      input.image.kind === 'catalog'
        ? MonsterImageRef.catalog(input.image.imageId)
        : MonsterImageRef.upload(`${monsterId.value}-image`);
    const monster = Monster.create({
      id: monsterId,
      name: input.name,
      attack: input.attack,
      defense: input.defense,
      speed: input.speed,
      hp: input.hp,
      image,
      createdAt: new Date()
    });

    await this.repository.add(monster, upload);
    return mapMonsterToDto(monster);
  }

  private async validateUpload(
    monsterId: string,
    upload: Extract<RegisterMonsterInput['image'], { kind: 'upload' }>
  ): Promise<PersistedUploadedImageContent> {
    const result = await this.imageValidator.inspect(upload);
    if (!result.valid) {
      throw new ApplicationError('IMAGE_INVALID', result.reason ?? 'A imagem enviada é inválida.');
    }
    return {
      id: `${monsterId}-image`,
      fileName: upload.fileName,
      mediaType: upload.mediaType,
      sizeBytes: upload.sizeBytes,
      bytes: upload.bytes
    };
  }
}

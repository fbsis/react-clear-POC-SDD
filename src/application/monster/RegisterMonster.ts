import { ApplicationError } from '@application/shared/errors/ApplicationError';
import type { IdGenerator } from '@application/shared/ports/IdGenerator';
import { assertNever } from '@application/shared/assertNever';
import { Monster, MonsterId, MonsterImageRef } from '@domains/monster';
import type { RegisterMonsterUseCase } from './contracts/RegisterMonsterUseCase';
import type { MonsterDto } from './dtos/MonsterDto';
import type { RegisterMonsterInput } from './dtos/RegisterMonsterInput';
import { mapMonsterToDto } from './mapMonsterToDto';
import type { ImageValidator } from './ports/ImageValidator';
import type { MonsterImageCatalog } from './ports/MonsterImageCatalog';
import type { MonsterRepository } from './ports/MonsterRepository';
import type { PersistedUploadedImageContent } from './ports/PersistedUploadedImageContent';

export class RegisterMonster implements RegisterMonsterUseCase {
  private readonly repository: MonsterRepository;
  private readonly idGenerator: IdGenerator;
  private readonly imageValidator: ImageValidator;
  private readonly imageCatalog: MonsterImageCatalog;

  public constructor(
    repository: MonsterRepository,
    idGenerator: IdGenerator,
    imageValidator: ImageValidator,
    imageCatalog: MonsterImageCatalog
  ) {
    this.repository = repository;
    this.idGenerator = idGenerator;
    this.imageValidator = imageValidator;
    this.imageCatalog = imageCatalog;
  }

  public async execute(input: RegisterMonsterInput): Promise<MonsterDto> {
    const monsterId = MonsterId.create(this.idGenerator.next());
    let image: MonsterImageRef;
    let upload: PersistedUploadedImageContent | undefined;

    switch (input.image.kind) {
      case 'catalog':
        if (!(await this.imageCatalog.findById(input.image.imageId.trim()))) {
          throw new ApplicationError(
            'IMAGE_INVALID',
            'A imagem escolhida não está mais disponível. Escolha outro retrato.'
          );
        }
        image = MonsterImageRef.catalog(input.image.imageId);
        break;
      case 'upload':
        upload = await this.validateUpload(monsterId.value, input.image);
        image = MonsterImageRef.upload(upload.id);
        break;
      default:
        assertNever(input.image);
    }

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

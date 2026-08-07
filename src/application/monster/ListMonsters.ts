import type { ListMonstersUseCase } from './contracts/ListMonstersUseCase';
import type { MonsterDto } from './dtos/MonsterDto';
import { mapMonsterToDto } from './mapMonsterToDto';
import type { MonsterRepository } from './ports/MonsterRepository';

export class ListMonsters implements ListMonstersUseCase {
  private readonly repository: MonsterRepository;

  public constructor(repository: MonsterRepository) {
    this.repository = repository;
  }

  public async execute(): Promise<readonly MonsterDto[]> {
    return (await this.repository.list()).map(mapMonsterToDto);
  }
}

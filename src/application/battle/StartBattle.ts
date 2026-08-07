import { ApplicationError } from '@application/shared/errors/ApplicationError';
import { resolveBattle } from '@domains/battle/resolveBattle';
import { MonsterId } from '@domains/monster';
import type { MonsterRepository } from '../monster/ports/MonsterRepository';
import type { StartBattleUseCase } from './contracts/StartBattleUseCase';
import type { BattleDto } from './dtos/BattleDto';
import type { StartBattleInput } from './dtos/StartBattleInput';
import { mapBattleToDto } from './mapBattleToDto';

export class StartBattle implements StartBattleUseCase {
  private readonly repository: MonsterRepository;

  public constructor(repository: MonsterRepository) {
    this.repository = repository;
  }

  public async execute(input: StartBattleInput): Promise<BattleDto> {
    const firstMonsterId = input.firstMonsterId.trim();
    const secondMonsterId = input.secondMonsterId.trim();
    if (!firstMonsterId || !secondMonsterId || firstMonsterId === secondMonsterId) {
      throw new ApplicationError(
        'BATTLE_INVALID',
        'Selecione dois monstros diferentes para iniciar a batalha.'
      );
    }

    const [firstMonster, secondMonster] = await Promise.all([
      this.repository.findById(MonsterId.create(firstMonsterId)),
      this.repository.findById(MonsterId.create(secondMonsterId))
    ]);
    if (!firstMonster) {
      throw missingMonster(firstMonsterId);
    }
    if (!secondMonster) {
      throw missingMonster(secondMonsterId);
    }

    return mapBattleToDto(resolveBattle(firstMonster, secondMonster));
  }
}

function missingMonster(monsterId: string): ApplicationError {
  return new ApplicationError('MONSTER_NOT_FOUND', 'O monstro selecionado não foi encontrado.', {
    monsterId
  });
}

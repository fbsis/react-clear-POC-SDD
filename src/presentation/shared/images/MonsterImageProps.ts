import type { MonsterImageReferenceDto } from '@application/monster/dtos/MonsterImageReferenceDto';

export interface MonsterImageProps {
  readonly reference: MonsterImageReferenceDto;
  readonly monsterName: string;
  readonly loadingLabel?: string;
}

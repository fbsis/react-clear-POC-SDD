import type { MonsterImageReferenceDto } from './MonsterImageReferenceDto';

export interface MonsterDto {
  readonly id: string;
  readonly name: string;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  readonly hp: number;
  readonly image: MonsterImageReferenceDto;
}

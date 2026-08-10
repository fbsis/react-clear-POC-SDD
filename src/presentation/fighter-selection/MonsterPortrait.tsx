import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { MonsterImage } from '@presentation/shared/images/MonsterImage';
import styles from './FighterSelectionPage.module.css';

export function MonsterPortrait({ monster }: Readonly<{ monster: MonsterDto }>) {
  return (
    <span className={styles.portraitFrame}>
      <MonsterImage reference={monster.image} monsterName={monster.name} />
    </span>
  );
}

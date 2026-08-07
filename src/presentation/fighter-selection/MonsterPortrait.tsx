import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { useMonsterImageUrl } from '@presentation/shared/images/useMonsterImageUrl';
import styles from './FighterSelectionPage.module.css';

export function MonsterPortrait({ monster }: Readonly<{ monster: MonsterDto }>) {
  const imageUrl = useMonsterImageUrl(monster.image);

  return (
    <span className={styles.portraitFrame}>
      {imageUrl ? (
        <img src={imageUrl} alt={`Retrato de ${monster.name}`} />
      ) : (
        <span className={styles.imageLoading}>Invocando…</span>
      )}
    </span>
  );
}

import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { MonsterPortrait } from './MonsterPortrait';
import styles from './FighterSelectionPage.module.css';

export function FighterPreview({ monster }: Readonly<{ monster: MonsterDto | null }>) {
  if (!monster) {
    return <aside className={styles.preview}>Nenhum monstro disponível.</aside>;
  }

  return (
    <aside className={styles.preview} aria-label={`Prévia de ${monster.name}`}>
      <div className={styles.previewPortrait}>
        <MonsterPortrait monster={monster} />
        <span className={styles.previewSigil} aria-hidden="true">
          ✦
        </span>
      </div>
      <div className={styles.previewBody}>
        <span className={styles.eyebrow}>Combatente em destaque</span>
        <h2>{monster.name}</h2>
        <dl className={styles.stats}>
          <Stat label="Ataque" value={monster.attack} />
          <Stat label="Defesa" value={monster.defense} />
          <Stat label="Velocidade" value={monster.speed} />
          <Stat label="Vida" value={monster.hp} />
        </dl>
      </div>
    </aside>
  );
}

function Stat({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

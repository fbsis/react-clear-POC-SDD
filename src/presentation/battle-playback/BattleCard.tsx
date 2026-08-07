import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { ProgressBar } from '@presentation/shared/components/ProgressBar';
import { useMonsterImageUrl } from '@presentation/shared/images/useMonsterImageUrl';
import styles from './BattlePlaybackPage.module.css';

export function BattleCard({
  monster,
  currentHp,
  isAttacker,
  isDefender,
  isWinner,
  isDefeated
}: Readonly<{
  monster: MonsterDto;
  currentHp: number;
  isAttacker: boolean;
  isDefender: boolean;
  isWinner: boolean;
  isDefeated: boolean;
}>) {
  const imageUrl = useMonsterImageUrl(monster.image);

  return (
    <article
      className={styles.battleCard}
      aria-label={monster.name}
      data-attacker={isAttacker}
      data-defender={isDefender}
      data-winner={isWinner}
      data-defeated={isDefeated}
    >
      <div className={styles.cardPortrait}>
        {imageUrl ? (
          <img src={imageUrl} alt={`Retrato de ${monster.name}`} />
        ) : (
          <span>Invocando…</span>
        )}
        {isAttacker ? <span className={styles.attackSeal}>Atacando</span> : null}
        {isDefender ? <span className={styles.impactSeal}>Impacto</span> : null}
        {isWinner ? <span className={styles.winnerSeal}>Vencedor</span> : null}
        {isDefeated ? <span className={styles.defeatedSeal}>Derrotado</span> : null}
      </div>
      <div className={styles.cardBody}>
        <h2>{monster.name}</h2>
        <dl className={styles.cardStats}>
          <Stat label="Ataque" value={monster.attack} />
          <Stat label="Defesa" value={monster.defense} />
          <Stat label="Velocidade" value={monster.speed} />
        </dl>
        <ProgressBar label={`Vida de ${monster.name}`} value={currentHp} maximum={monster.hp} />
      </div>
    </article>
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

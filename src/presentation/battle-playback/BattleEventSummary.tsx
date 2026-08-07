import type { BattleEventDto } from '@application/battle/dtos/BattleEventDto';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import styles from './BattlePlaybackPage.module.css';

export function BattleEventSummary({
  event,
  attacker,
  defender,
  actionNumber,
  totalActions
}: Readonly<{
  event: BattleEventDto | null;
  attacker: MonsterDto | null;
  defender: MonsterDto | null;
  actionNumber: number | null;
  totalActions: number;
}>) {
  if (!event || !attacker || !defender) {
    return (
      <section className={styles.eventSummary} aria-label="Evento atual">
        <span className={styles.eventEyebrow}>Os portões estão abertos</span>
        <h2>Combate pronto</h2>
        <p>Use Play para revelar o primeiro ataque ou escolha um round na linha do tempo.</p>
      </section>
    );
  }

  return (
    <section className={styles.eventSummary} aria-label="Evento atual">
      <span className={styles.eventEyebrow}>
        Round {event.roundNumber} · Ação {actionNumber} de {totalActions}
      </span>
      <h2>
        {attacker.name} ataca {defender.name}
      </h2>
      <strong className={styles.damageBadge}>-{event.damage} HP</strong>
      <p>
        Golpe mágico causa {event.damage} de dano. {defender.name} fica com {event.defenderHpAfter}{' '}
        de vida.
      </p>
    </section>
  );
}

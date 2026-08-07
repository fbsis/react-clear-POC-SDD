import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { Button } from '@presentation/shared/components/Button';
import { MonsterPortrait } from './MonsterPortrait';
import styles from './FighterSelectionPage.module.css';

export function FighterSlots({
  firstMonster,
  secondMonster,
  activeSide,
  onActivate,
  onRemove
}: Readonly<{
  firstMonster: MonsterDto | null;
  secondMonster: MonsterDto | null;
  activeSide: 'first' | 'second';
  onActivate: (side: 'first' | 'second') => void;
  onRemove: (side: 'first' | 'second') => void;
}>) {
  return (
    <div className={styles.slots} aria-label="Lutadores escolhidos">
      <FighterSlot
        label="Lutador 1"
        side="first"
        monster={firstMonster}
        active={activeSide === 'first'}
        onActivate={onActivate}
        onRemove={onRemove}
      />
      <span className={styles.versus} aria-hidden="true">
        VS
      </span>
      <FighterSlot
        label="Lutador 2"
        side="second"
        monster={secondMonster}
        active={activeSide === 'second'}
        onActivate={onActivate}
        onRemove={onRemove}
      />
    </div>
  );
}

function FighterSlot({
  label,
  side,
  monster,
  active,
  onActivate,
  onRemove
}: Readonly<{
  label: string;
  side: 'first' | 'second';
  monster: MonsterDto | null;
  active: boolean;
  onActivate: (side: 'first' | 'second') => void;
  onRemove: (side: 'first' | 'second') => void;
}>) {
  return (
    <section className={styles.slot} data-active={active} aria-label={label}>
      <button
        type="button"
        className={styles.slotTarget}
        onClick={() => {
          onActivate(side);
        }}
      >
        <span className={styles.slotLabel}>{active ? '✦ Escolhendo' : label}</span>
        {monster ? (
          <>
            <MonsterPortrait monster={monster} />
            <strong>{monster.name}</strong>
            <span>
              ATQ {monster.attack} · DEF {monster.defense} · VEL {monster.speed} · HP {monster.hp}
            </span>
          </>
        ) : (
          <span className={styles.emptySlot}>Selecione um retrato</span>
        )}
      </button>
      {monster ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            onRemove(side);
          }}
        >
          Remover {label.toLowerCase()}
        </Button>
      ) : null}
    </section>
  );
}

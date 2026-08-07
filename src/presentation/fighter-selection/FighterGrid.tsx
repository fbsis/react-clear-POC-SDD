import { useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { MonsterDto } from '@application/monster/dtos/MonsterDto';
import { MonsterPortrait } from './MonsterPortrait';
import styles from './FighterSelectionPage.module.css';

export function FighterGrid({
  monsters,
  focusedMonsterId,
  selectedMonsterIds,
  onFocusMonster,
  onSelectMonster
}: Readonly<{
  monsters: readonly MonsterDto[];
  focusedMonsterId: string | null;
  selectedMonsterIds: readonly string[];
  onFocusMonster: (monsterId: string) => void;
  onSelectMonster: (monsterId: string) => void;
}>) {
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, currentIndex: number): void {
    let targetIndex: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        targetIndex = Math.min(currentIndex + 1, monsters.length - 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        targetIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = monsters.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    const target = monsters[targetIndex];
    if (target) {
      onFocusMonster(target.id);
      buttons.current.get(target.id)?.focus();
    }
  }

  return (
    <div className={styles.grid} role="grid" aria-label="Selecionar lutadores">
      {monsters.map((monster, index) => {
        const selected = selectedMonsterIds.includes(monster.id);
        return (
          <div key={monster.id} role="row" className={styles.gridRow}>
            <div role="gridcell" aria-selected={selected} className={styles.gridCell}>
              <button
                ref={(button) => {
                  if (button) buttons.current.set(monster.id, button);
                  else buttons.current.delete(monster.id);
                }}
                type="button"
                className={styles.portraitButton}
                data-selected={selected}
                aria-label={`Selecionar ${monster.name}`}
                tabIndex={monster.id === focusedMonsterId ? 0 : -1}
                onFocus={() => {
                  onFocusMonster(monster.id);
                }}
                onClick={() => {
                  onSelectMonster(monster.id);
                }}
                onKeyDown={(event) => {
                  moveFocus(event, index);
                }}
              >
                <MonsterPortrait monster={monster} />
                <strong>{monster.name}</strong>
                {selected ? <span className={styles.selectedSeal}>Escolhido</span> : null}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

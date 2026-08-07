import { useMemo, useReducer, useState } from 'react';
import { useGameSession } from '@app/hooks/useGameSession';
import { useMonsterCollection } from '@app/hooks/useMonsterCollection';
import { Button } from '@presentation/shared/components/Button';
import { StatusMessage } from '@presentation/shared/components/StatusMessage';
import { FighterGrid } from './FighterGrid';
import { FighterPreview } from './FighterPreview';
import { FighterSlots } from './FighterSlots';
import {
  createInitialFighterSelectionState,
  fighterSelectionReducer
} from './fighterSelectionReducer';
import styles from './FighterSelectionPage.module.css';

export function FighterSelectionPage() {
  const { monsters } = useMonsterCollection();
  const session = useGameSession();
  const [state, dispatch] = useReducer(
    fighterSelectionReducer,
    monsters[0]?.id ?? null,
    createInitialFighterSelectionState
  );
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const monstersById = useMemo(
    () => new Map(monsters.map((monster) => [monster.id, monster])),
    [monsters]
  );
  const focusedMonster = state.focusedMonsterId
    ? (monstersById.get(state.focusedMonsterId) ?? null)
    : null;
  const firstMonster = state.firstMonsterId
    ? (monstersById.get(state.firstMonsterId) ?? null)
    : null;
  const secondMonster = state.secondMonsterId
    ? (monstersById.get(state.secondMonsterId) ?? null)
    : null;

  async function confirmBattle(): Promise<void> {
    if (!state.firstMonsterId || !state.secondMonsterId) return;
    setIsStarting(true);
    setStartError(null);
    try {
      await session.startBattle(state.firstMonsterId, state.secondMonsterId);
    } catch {
      setStartError('Não foi possível preparar a batalha. Tente novamente.');
    } finally {
      setIsStarting(false);
    }
  }

  if (monsters.length < 2) {
    return (
      <section className={styles.emptyState}>
        <h1>Reúna dois monstros</h1>
        <p>A arena precisa de dois combatentes distintos antes de abrir os portões.</p>
        <Button
          type="button"
          onClick={() => {
            session.navigate('registration');
          }}
        >
          Voltar ao cadastro
        </Button>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="selection-title">
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Grande salão do torneio</span>
        <h1 id="selection-title">Escolha seus lutadores</h1>
        <p>Dois estandartes, duas criaturas e uma disputa de estratégia.</p>
      </header>

      <FighterSlots
        firstMonster={firstMonster}
        secondMonster={secondMonster}
        activeSide={state.activeSide}
        onActivate={(side) => {
          dispatch({ type: 'activate', side });
        }}
        onRemove={(side) => {
          dispatch({ type: 'remove', side });
        }}
      />

      <div className={styles.selectionHall}>
        <FighterPreview monster={focusedMonster} />
        <div className={styles.roster}>
          <div className={styles.rosterHeading}>
            <span>Galeria dos convocados</span>
            <strong>{monsters.length} disponíveis</strong>
          </div>
          <FighterGrid
            monsters={monsters}
            focusedMonsterId={state.focusedMonsterId}
            selectedMonsterIds={[state.firstMonsterId, state.secondMonsterId].filter(
              (id): id is string => Boolean(id)
            )}
            onFocusMonster={(monsterId) => {
              dispatch({ type: 'focus', monsterId });
            }}
            onSelectMonster={(monsterId) => {
              dispatch({ type: 'select', monsterId });
            }}
          />
        </div>
      </div>

      {state.message ? <StatusMessage>{state.message}</StatusMessage> : null}
      {startError ? <StatusMessage tone="danger">{startError}</StatusMessage> : null}
      <div className={styles.actions}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            session.navigate('registration');
          }}
        >
          Voltar à companhia
        </Button>
        <Button
          type="button"
          disabled={!firstMonster || !secondMonster || isStarting}
          onClick={() => void confirmBattle()}
        >
          {isStarting ? 'Calculando…' : 'Iniciar batalha'}
        </Button>
      </div>
    </section>
  );
}

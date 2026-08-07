import { Button } from '@presentation/shared/components/Button';
import { createRoundWindow } from './roundWindow';
import styles from './BattlePlaybackPage.module.css';

export function RoundTimeline({
  totalRounds,
  activeRoundNumber,
  onSelectRound
}: Readonly<{
  totalRounds: number;
  activeRoundNumber: number;
  onSelectRound: (roundNumber: number) => void;
}>) {
  const model = createRoundWindow(totalRounds, activeRoundNumber);

  return (
    <section className={styles.timeline} aria-label="Linha do tempo da batalha">
      <div className={styles.timelineControls}>
        <Button
          type="button"
          variant="ghost"
          disabled={model.activeRoundNumber === 1}
          aria-label={
            model.activeRoundNumber === 1 ? 'Round anterior indisponível' : 'Round anterior'
          }
          onClick={() => {
            onSelectRound(model.activeRoundNumber - 1);
          }}
        >
          ← Anterior
        </Button>
        <strong>
          Round {model.activeRoundNumber} de {model.totalRounds}
        </strong>
        <Button
          type="button"
          variant="ghost"
          disabled={model.activeRoundNumber === model.totalRounds}
          aria-label={
            model.activeRoundNumber === model.totalRounds
              ? 'Próximo round indisponível'
              : 'Próximo round'
          }
          onClick={() => {
            onSelectRound(model.activeRoundNumber + 1);
          }}
        >
          Próximo →
        </Button>
      </div>
      <ol className={styles.markers}>
        {model.visibleRoundNumbers.map((roundNumber) => (
          <li key={roundNumber}>
            <button
              type="button"
              aria-current={roundNumber === model.activeRoundNumber ? 'step' : undefined}
              aria-label={`Round ${String(roundNumber)} de ${String(model.totalRounds)}`}
              onClick={() => {
                onSelectRound(roundNumber);
              }}
            >
              {roundNumber}
            </button>
          </li>
        ))}
      </ol>
      {model.isWindowed ? (
        <label className={styles.roundJump}>
          Ir para o round
          <input
            type="number"
            min={1}
            max={model.totalRounds}
            value={model.activeRoundNumber}
            onChange={(event) => {
              onSelectRound(Number(event.currentTarget.value));
            }}
          />
        </label>
      ) : null}
    </section>
  );
}

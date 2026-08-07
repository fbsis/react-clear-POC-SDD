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
  const firstVisibleRound = model.visibleRoundNumbers[0] ?? 1;
  const lastVisibleRound = model.visibleRoundNumbers.at(-1) ?? firstVisibleRound;
  const visibleRoundSpan = Math.max(1, lastVisibleRound - firstVisibleRound);
  const progressPercent = ((model.activeRoundNumber - firstVisibleRound) / visibleRoundSpan) * 100;
  const minimumRailWidth = Math.max(1, model.visibleRoundNumbers.length - 1) * 2.75 + 2.75;

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
      <div className={styles.progressScroller}>
        <div
          className={styles.progressNavigator}
          style={{ minWidth: `max(100%, ${String(minimumRailWidth)}rem)` }}
        >
          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${String(progressPercent)}%` }} />
          </div>
          <input
            className={styles.progressRange}
            type="range"
            min={firstVisibleRound}
            max={lastVisibleRound}
            step={1}
            value={model.activeRoundNumber}
            aria-label="Navegar pelos rounds"
            aria-valuetext={`Round ${String(model.activeRoundNumber)} de ${String(model.totalRounds)}`}
            onChange={(event) => {
              onSelectRound(Number(event.currentTarget.value));
            }}
          />
          <ol className={styles.progressMarkers}>
            {model.visibleRoundNumbers.map((roundNumber, index) => {
              const markerPercent =
                model.visibleRoundNumbers.length === 1
                  ? 0
                  : (index / (model.visibleRoundNumbers.length - 1)) * 100;
              return (
                <li key={roundNumber} style={{ left: `${String(markerPercent)}%` }}>
                  <button
                    type="button"
                    aria-current={roundNumber === model.activeRoundNumber ? 'step' : undefined}
                    aria-label={`Round ${String(roundNumber)} de ${String(model.totalRounds)}`}
                    onClick={() => {
                      onSelectRound(roundNumber);
                    }}
                  >
                    <span>{roundNumber}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
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

import type { ProgressBarProps } from './ProgressBarProps';
import styles from './sharedComponents.module.css';

export function ProgressBar({ label, maximum, value }: ProgressBarProps) {
  const safeMaximum = Math.max(1, maximum);
  const safeValue = Math.min(Math.max(0, value), safeMaximum);
  const width = `${String((safeValue / safeMaximum) * 100)}%`;

  return (
    <div className={styles.progressGroup}>
      <div className={styles.progressLabel}>
        <span>{label}</span>
        <span>
          {safeValue} / {safeMaximum}
        </span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={safeMaximum}
        aria-valuemin={0}
        aria-valuenow={safeValue}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span className={styles.progressValue} style={{ width }} />
      </div>
    </div>
  );
}

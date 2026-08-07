import type { StatusMessageProps } from './StatusMessageProps';
import styles from './sharedComponents.module.css';

export function StatusMessage({ children, tone = 'info' }: StatusMessageProps) {
  const classes = [styles.status, styles[tone]]
    .filter((className): className is string => Boolean(className))
    .join(' ');

  return (
    <div className={classes} role={tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

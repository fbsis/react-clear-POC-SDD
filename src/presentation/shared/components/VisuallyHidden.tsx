import type { VisuallyHiddenProps } from './VisuallyHiddenProps';
import styles from './sharedComponents.module.css';

export function VisuallyHidden({ children }: VisuallyHiddenProps) {
  return <span className={styles.visuallyHidden}>{children}</span>;
}

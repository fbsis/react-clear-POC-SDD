import type { FieldErrorProps } from './FieldErrorProps';
import styles from './sharedComponents.module.css';

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <span className={styles.fieldError} id={id} role="alert">
      {message}
    </span>
  );
}

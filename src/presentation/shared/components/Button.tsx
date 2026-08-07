import type { ButtonProps } from './ButtonProps';
import styles from './sharedComponents.module.css';

export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

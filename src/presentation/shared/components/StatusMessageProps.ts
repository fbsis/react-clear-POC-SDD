import type { ReactNode } from 'react';

export interface StatusMessageProps {
  readonly children: ReactNode;
  readonly tone?: 'info' | 'success' | 'danger';
}

import type { PropsWithChildren } from 'react';
import type { Application } from '@application/Application';

export interface ApplicationProviderProps extends PropsWithChildren {
  readonly application: Application;
}

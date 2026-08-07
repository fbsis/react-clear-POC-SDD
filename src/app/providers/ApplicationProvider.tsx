import { ApplicationContext } from '../contexts/ApplicationContext';
import type { ApplicationProviderProps } from './ApplicationProviderProps';

export function ApplicationProvider({ application, children }: ApplicationProviderProps) {
  return <ApplicationContext.Provider value={application}>{children}</ApplicationContext.Provider>;
}

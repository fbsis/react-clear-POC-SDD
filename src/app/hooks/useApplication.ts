import { useContext } from 'react';
import type { Application } from '@application/Application';
import { ApplicationContext } from '../contexts/ApplicationContext';

export function useApplication(): Application {
  const application = useContext(ApplicationContext);
  if (!application) {
    throw new Error('useApplication must be used inside ApplicationProvider.');
  }
  return application;
}

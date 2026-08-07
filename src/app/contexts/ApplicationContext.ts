import { createContext } from 'react';
import type { Application } from '@application/Application';

export const ApplicationContext = createContext<Application | undefined>(undefined);

import type { StorageEstimate } from './StorageEstimate';

export interface StorageStatus {
  estimate(): Promise<StorageEstimate>;
  requestPersistence(): Promise<boolean>;
}

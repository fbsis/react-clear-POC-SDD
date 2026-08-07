import type { StorageEstimate } from '@application/shared/ports/StorageEstimate';
import type { StorageStatus } from '@application/shared/ports/StorageStatus';

export class BrowserStorageStatus implements StorageStatus {
  public async estimate(): Promise<StorageEstimate> {
    const storage = (navigator as Partial<Navigator>).storage;
    if (!storage) {
      return {};
    }
    const estimate = await storage.estimate();
    return {
      ...(estimate.usage === undefined ? {} : { usage: estimate.usage }),
      ...(estimate.quota === undefined ? {} : { quota: estimate.quota })
    };
  }

  public async requestPersistence(): Promise<boolean> {
    const storage = (navigator as Partial<Navigator>).storage;
    if (!storage || typeof storage.persist !== 'function') {
      return false;
    }
    return storage.persist();
  }
}

import type { StorageEstimate } from '@application/shared/ports/StorageEstimate';
import type { StorageStatus } from '@application/shared/ports/StorageStatus';

export class BrowserStorageStatus implements StorageStatus {
  public async estimate(): Promise<StorageEstimate> {
    const estimate = await navigator.storage.estimate();
    return {
      ...(estimate.usage === undefined ? {} : { usage: estimate.usage }),
      ...(estimate.quota === undefined ? {} : { quota: estimate.quota })
    };
  }

  public async requestPersistence(): Promise<boolean> {
    return navigator.storage.persist();
  }
}

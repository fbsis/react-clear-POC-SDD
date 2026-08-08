export interface LocalDatabaseResetter {
  reset(): Promise<void>;
}

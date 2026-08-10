import type { BundledCatalogRecord } from './BundledCatalogRecord';

const MINIMUM_CATALOG_SIZE = 6;

export function validateBundledCatalogRecords(value: unknown): readonly BundledCatalogRecord[] {
  if (!Array.isArray(value) || value.length < MINIMUM_CATALOG_SIZE) {
    throw new Error('Monster catalog must contain at least six images.');
  }

  const records = value.map(validateRecord);
  const uniqueIds = new Set(records.map((record) => record.id));
  if (uniqueIds.size !== records.length) {
    throw new Error('Monster catalog contains duplicate IDs.');
  }
  return Object.freeze(records);
}

function validateRecord(value: unknown): BundledCatalogRecord {
  if (!isRecord(value)) {
    throw new Error('Monster catalog contains an invalid record.');
  }

  const { id, name, file, alt, width, height } = value;
  if (
    !isNonBlankString(id) ||
    !isNonBlankString(name) ||
    !isNonBlankString(file) ||
    !isNonBlankString(alt) ||
    !isPositiveInteger(width) ||
    !isPositiveInteger(height)
  ) {
    throw new Error('Monster catalog contains invalid image metadata.');
  }

  return Object.freeze({
    id: id.trim(),
    name: name.trim(),
    file: file.trim(),
    alt: alt.trim(),
    width,
    height
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonBlankString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

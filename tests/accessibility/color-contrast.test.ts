// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync('src/presentation/shared/styles/tokens.css', 'utf8');

describe('color contrast contract', () => {
  it.each([
    ['primary text on night stone', '--color-text', '--color-night-900', 4.5],
    ['secondary text on night stone', '--color-text-muted', '--color-night-900', 4.5],
    ['ink on parchment', '--color-ink-900', '--color-parchment-100', 4.5],
    ['ink on antique brass', '--color-ink-900', '--color-brass-500', 4.5],
    ['danger feedback on night stone', '--color-danger', '--color-night-900', 4.5],
    ['success feedback on night stone', '--color-success', '--color-night-900', 4.5],
    ['focus outline on night stone', '--color-focus', '--color-night-900', 3]
  ])('%s meets its WCAG contrast threshold', (_label, foreground, background, threshold) => {
    expect(contrastRatio(colorToken(foreground), colorToken(background))).toBeGreaterThanOrEqual(
      threshold
    );
  });
});

function colorToken(name: string): string {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const value = new RegExp(`${escapedName}:\\s*(#[0-9a-f]{6})`, 'iu').exec(tokens)?.[1];
  if (!value) {
    throw new Error(`Missing hexadecimal color token: ${name}`);
  }
  return value;
}

function contrastRatio(first: string, second: string): number {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: string): number {
  const channels = [1, 3, 5].map(
    (offset) => Number.parseInt(color.slice(offset, offset + 2), 16) / 255
  );
  const [red = 0, green = 0, blue = 0] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import { hasStored, readStored, writeStored } from './storage';

const asNumber = (value: unknown) => (typeof value === 'number' ? value : null);

afterEach(() => vi.restoreAllMocks());

describe('storage', () => {
  it('round-trips a value', () => {
    writeStored('k', 5);
    expect(readStored('k', asNumber, 0)).toBe(5);
    expect(hasStored('k')).toBe(true);
  });

  it('returns the fallback for a missing key', () => {
    expect(readStored('missing', asNumber, 7)).toBe(7);
    expect(hasStored('missing')).toBe(false);
  });

  it('returns the fallback for broken JSON', () => {
    window.localStorage.setItem('k', '{not json');
    expect(readStored('k', asNumber, 1)).toBe(1);
  });

  it('returns the fallback when the value fails validation', () => {
    window.localStorage.setItem('k', JSON.stringify('text'));
    expect(readStored('k', asNumber, 1)).toBe(1);
  });

  it('survives a blocked or full store', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    expect(() => writeStored('k', 1)).not.toThrow();
    expect(readStored('k', asNumber, 3)).toBe(3);
    expect(hasStored('k')).toBe(false);
  });
});

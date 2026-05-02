import { describe, it, expect } from 'vitest';
import { formatPosition } from '../src/formatPosition';

describe('formatPosition', () => {
  it('converts 0-based cursor position to 1-based string', () => {
    const result = formatPosition({
      relativePath: 'src/utils/helper.ts',
      line: 41,
      character: 16,
    });

    expect(result).toBe('src/utils/helper.ts:42:17');
  });
});

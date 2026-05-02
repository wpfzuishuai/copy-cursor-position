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

  it('includes end position when selection range is provided', () => {
    const result = formatPosition({
      relativePath: 'src/index.ts',
      line: 0,
      character: 0,
      endLine: 2,
      endCharacter: 4,
    });

    expect(result).toBe('src/index.ts:1:1-3:5');
  });
});

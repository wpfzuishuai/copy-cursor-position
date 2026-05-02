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

  it('handles first line first column (0,0 to 1:1)', () => {
    const result = formatPosition({
      relativePath: 'a.ts',
      line: 0,
      character: 0,
    });

    expect(result).toBe('a.ts:1:1');
  });

  it('handles large line and character numbers', () => {
    const result = formatPosition({
      relativePath: 'deep/nested/file.ts',
      line: 999,
      character: 99,
    });

    expect(result).toBe('deep/nested/file.ts:1000:100');
  });

  it('handles selection where start equals end (degenerate range)', () => {
    const result = formatPosition({
      relativePath: 'file.ts',
      line: 5,
      character: 3,
      endLine: 5,
      endCharacter: 3,
    });

    expect(result).toBe('file.ts:6:4-6:4');
  });
});

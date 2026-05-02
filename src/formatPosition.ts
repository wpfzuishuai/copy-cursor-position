export type FormatParams = {
  relativePath: string;
  line: number;
  character: number;
  endLine?: number;
  endCharacter?: number;
};

export function formatPosition(params: FormatParams): string {
  const { relativePath, line, character, endLine, endCharacter } = params;

  const start = `${relativePath}:${line + 1}:${character + 1}`;

  if (endLine !== undefined && endCharacter !== undefined) {
    return `${start}-${endLine + 1}:${endCharacter + 1}`;
  }

  return start;
}

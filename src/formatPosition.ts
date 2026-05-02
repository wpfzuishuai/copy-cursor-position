export type FormatParams = {
  relativePath: string;
  line: number;
  character: number;
  endLine?: number;
  endCharacter?: number;
};

export function formatPosition(params: FormatParams): string {
  const { relativePath, line, character } = params;
  return `${relativePath}:${line + 1}:${character + 1}`;
}

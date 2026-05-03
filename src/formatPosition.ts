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

export type DiagnosticSeverity = "error" | "warning" | "info" | "hint";

export type FormatDiagnosticParams = {
  relativePath: string;
  line: number;
  character: number;
  severity: DiagnosticSeverity;
  message: string;
};

export function formatDiagnosticPosition(
  params: FormatDiagnosticParams,
): string {
  const { relativePath, line, character, severity, message } = params;
  const position = `${relativePath}:${line + 1}:${character + 1}`;
  return `${position} - ${severity}: ${message}`;
}

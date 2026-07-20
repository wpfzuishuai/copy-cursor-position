/** 光标位置参数（无选区） */
export interface IFormatCursorParams {
  /** 相对路径 */
  relativePath: string;
  /** 行号（0-based） */
  line: number;
  /** 列号（0-based） */
  character: number;
}

/** 选区位置参数（有选区） */
export interface IFormatSelectionParams extends IFormatCursorParams {
  /** 选区结束行号（0-based） */
  endLine: number;
  /** 选区结束列号（0-based） */
  endCharacter: number;
}

/** 格式化位置参数：光标或选区 */
export type TFormatParams = IFormatCursorParams | IFormatSelectionParams;

/** 诊断信息严重级别 */
export type TDiagnosticSeverity = "error" | "warning" | "info" | "hint";

/** 格式化诊断位置参数 */
export type TFormatDiagnosticParams = {
  /** 相对路径 */
  relativePath: string;
  /** 行号（0-based） */
  line: number;
  /** 列号（0-based） */
  character: number;
  /** 严重级别 */
  severity: TDiagnosticSeverity;
  /** 诊断信息 */
  message: string;
};

/** 将 0-based 位置格式化为 1-based 的 file:line:col 字符串 */
export const formatPosition = (params: TFormatParams): string => {
  const { relativePath, line, character } = params;

  // VS Code uses 0-based positions; output is 1-based for human readability
  const start = `${relativePath}:${line + 1}:${character + 1}`;

  // Selection range: attach end position
  if ("endLine" in params) {
    return `${start}-${params.endLine + 1}:${params.endCharacter + 1}`;
  }

  return start;
};

/** 将诊断信息格式化为 file:line:col - severity: message */
export const formatDiagnosticPosition = (
  params: TFormatDiagnosticParams,
): string => {
  const { relativePath, line, character, severity, message } = params;
  const position = `${relativePath}:${line + 1}:${character + 1}`;
  return `${position} - ${severity}: ${message}`;
};

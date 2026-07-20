import * as vscode from "vscode";
import type { TDiagnosticSeverity } from "./formatPosition";

/** VS Code severity 枚举 → 可读标签映射 */
export const SEVERITY_MAP: Record<
  vscode.DiagnosticSeverity,
  TDiagnosticSeverity
> = {
  [vscode.DiagnosticSeverity.Error]: "error",
  [vscode.DiagnosticSeverity.Warning]: "warning",
  [vscode.DiagnosticSeverity.Information]: "info",
  [vscode.DiagnosticSeverity.Hint]: "hint",
};

/** severity 排序权重，数值越小优先级越高 */
const SEVERITY_WEIGHT: Record<TDiagnosticSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  hint: 3,
};

/** getDocumentInfo 参数 */
export interface IGetDocumentInfoParams {
  /** VS Code 编辑器实例 */
  editor: vscode.TextEditor;
}

/** getDocumentInfo 返回值 */
export interface IDocumentInfo {
  /** 文档对象 */
  document: vscode.TextDocument;
  /** 相对路径 */
  relativePath: string;
  /** 当前选区 */
  selection: vscode.Selection;
}

/** 获取编辑器文档信息，未保存文件返回 null */
export const getDocumentInfo = ({
  editor,
}: IGetDocumentInfoParams): IDocumentInfo | null => {
  const document = editor.document;
  // Untitled files have no filesystem path — not useful for position copying
  if (document.isUntitled) {
    vscode.window.showWarningMessage("请先保存文件");
    return null;
  }

  return {
    document,
    relativePath: vscode.workspace.asRelativePath(document.uri),
    selection: editor.selection,
  };
};

/** getDiagnosticAtCursor 参数 */
export interface IGetDiagnosticAtCursorParams {
  /** 文档对象 */
  document: vscode.TextDocument;
  /** 光标位置 */
  position: vscode.Position;
}

/** getDiagnosticAtCursor 返回值 */
export interface IDiagnosticInfo {
  /** 严重级别 */
  severity: TDiagnosticSeverity;
  /** 诊断信息 */
  message: string;
}

/** 查找光标位置最严重的诊断信息 */
export const getDiagnosticAtCursor = ({
  document,
  position,
}: IGetDiagnosticAtCursorParams): IDiagnosticInfo | null => {
  // 按 severity 从高到低排序，取第一个匹配的
  const [first] = vscode.languages
    .getDiagnostics(document.uri)
    .filter((d) => d.range.contains(position))
    .sort((a, b) => SEVERITY_WEIGHT[SEVERITY_MAP[a.severity]] - SEVERITY_WEIGHT[SEVERITY_MAP[b.severity]]);

  if (!first) {
    return null;
  }

  return { severity: SEVERITY_MAP[first.severity], message: first.message };
};


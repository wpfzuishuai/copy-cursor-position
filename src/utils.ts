import * as vscode from "vscode";
import type { DiagnosticSeverity } from "./formatPosition";

export const SEVERITY_MAP: Record<vscode.DiagnosticSeverity, DiagnosticSeverity> = {
  [vscode.DiagnosticSeverity.Error]: "error",
  [vscode.DiagnosticSeverity.Warning]: "warning",
  [vscode.DiagnosticSeverity.Information]: "info",
  [vscode.DiagnosticSeverity.Hint]: "hint",
};

export function getDocumentInfo(editor: vscode.TextEditor): {
  document: vscode.TextDocument;
  relativePath: string;
  selection: vscode.Selection;
} | null {
  const document = editor.document;
  if (document.isUntitled) {
    vscode.window.showWarningMessage("请先保存文件");
    return null;
  }

  return {
    document,
    relativePath: vscode.workspace.asRelativePath(document.uri),
    selection: editor.selection,
  };
}

export function getDiagnosticAtCursor(
  document: vscode.TextDocument,
  position: vscode.Position,
): { severity: DiagnosticSeverity; message: string } | null {
  const diagnostics = vscode.languages.getDiagnostics(document.uri);
  for (const d of diagnostics) {
    if (d.range.contains(position)) {
      return { severity: SEVERITY_MAP[d.severity], message: d.message };
    }
  }
  return null;
}

export function copyToClipboard(text: string): void {
  vscode.env.clipboard.writeText(text).then(
    () => vscode.window.showInformationMessage(`已复制: ${text}`),
    (err: Error) => vscode.window.showErrorMessage(`复制失败: ${err.message}`),
  );
}

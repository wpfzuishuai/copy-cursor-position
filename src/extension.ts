import * as vscode from 'vscode';
import {
  formatPosition,
  formatDiagnosticPosition,
  type FormatParams,
  type DiagnosticSeverity,
} from './formatPosition';

const SEVERITY_MAP: Record<vscode.DiagnosticSeverity, DiagnosticSeverity> = {
  [vscode.DiagnosticSeverity.Error]: 'error',
  [vscode.DiagnosticSeverity.Warning]: 'warning',
  [vscode.DiagnosticSeverity.Information]: 'info',
  [vscode.DiagnosticSeverity.Hint]: 'hint',
};

function getDocumentInfo(editor: vscode.TextEditor): { document: vscode.TextDocument; relativePath: string; selection: vscode.Selection } | null {
  const document = editor.document;
  if (document.isUntitled) {
    vscode.window.showWarningMessage('请先保存文件');
    return null;
  }

  return {
    document,
    relativePath: vscode.workspace.asRelativePath(document.uri),
    selection: editor.selection,
  };
}

function getDiagnosticAtCursor(
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

function copyToClipboard(text: string): void {
  vscode.env.clipboard.writeText(text).then(
    () => {
      vscode.window.showInformationMessage(`已复制: ${text}`);
    },
    (err: Error) => {
      vscode.window.showErrorMessage(`复制失败: ${err.message}`);
    },
  );
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'copy-cursor-point.copyCursorPosition',
      () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('没有打开的编辑器');
          return;
        }
        const info = getDocumentInfo(editor);
        if (!info) return;

        const { relativePath, selection } = info;
        const { line, character } = selection.start;

        const params: FormatParams = { relativePath, line, character };

        if (!selection.isEmpty) {
          params.endLine = selection.end.line;
          params.endCharacter = selection.end.character;
        }

        copyToClipboard(formatPosition(params));
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'copy-cursor-point.copyErrorWithPosition',
      () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage('没有打开的编辑器');
          return;
        }
        const info = getDocumentInfo(editor);
        if (!info) return;

        const { document, relativePath, selection } = info;
        const position = selection.active;
        const diagnostic = getDiagnosticAtCursor(document, position);

        if (!diagnostic) {
          vscode.window.showInformationMessage('光标位置没有诊断信息');
          return;
        }

        copyToClipboard(
          formatDiagnosticPosition({
            relativePath,
            line: position.line,
            character: position.character,
            ...diagnostic,
          }),
        );
      },
    ),
  );
}

export function deactivate() {}

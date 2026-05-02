import * as vscode from "vscode";
import {
  formatPosition,
  formatDiagnosticPosition,
  type FormatParams,
  type DiagnosticSeverity,
} from "./formatPosition";

const SEVERITY_MAP: Record<vscode.DiagnosticSeverity, DiagnosticSeverity> = {
  [vscode.DiagnosticSeverity.Error]: "error",
  [vscode.DiagnosticSeverity.Warning]: "warning",
  [vscode.DiagnosticSeverity.Information]: "info",
  [vscode.DiagnosticSeverity.Hint]: "hint",
};

function getDocumentInfo(
  editor: vscode.TextEditor,
): {
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
    () => vscode.window.showInformationMessage(`已复制: ${text}`),
    (err: Error) => vscode.window.showErrorMessage(`复制失败: ${err.message}`),
  );
}

export function activate(context: vscode.ExtensionContext) {
  // Copy Cursor Position
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "copy-cursor-point.copyCursorPosition",
      () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("没有打开的编辑器");
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

  // Copy Error with Position — Quick Fix menu (Cmd+.)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "copy-cursor-point.copyErrorForDiagnostic",
      (
        documentUri: vscode.Uri,
        relativePath: string,
        line: number,
        character: number,
      ) => {
        const doc = vscode.workspace.textDocuments.find(
          (d) => d.uri.toString() === documentUri.toString(),
        );
        if (!doc) return;
        const pos = new vscode.Position(line, character);
        const diagnostic = getDiagnosticAtCursor(doc, pos);
        if (!diagnostic) {
          vscode.window.showInformationMessage("光标位置没有诊断信息");
          return;
        }
        copyToClipboard(
          formatDiagnosticPosition({
            relativePath,
            line,
            character,
            ...diagnostic,
          }),
        );
      },
    ),
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: "file" },
      {
        provideCodeActions(
          document: vscode.TextDocument,
          _range: vscode.Range | vscode.Selection,
          context: vscode.CodeActionContext,
        ): vscode.CodeAction[] {
          if (document.isUntitled) return [];

          const relativePath = vscode.workspace.asRelativePath(document.uri);

          return context.diagnostics.map((d) => {
            const action = new vscode.CodeAction(
              "Copy Error with Position",
              vscode.CodeActionKind.QuickFix,
            );
            action.command = {
              command: "copy-cursor-point.copyErrorForDiagnostic",
              title: "Copy Error with Position",
              arguments: [
                document.uri,
                relativePath,
                d.range.start.line,
                d.range.start.character,
              ],
            };
            return action;
          });
        },
      },
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] },
    ),
  );
}

export function deactivate() {}

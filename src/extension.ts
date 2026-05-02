import * as vscode from 'vscode';
import { formatPosition, type FormatParams } from './formatPosition';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'copy-cursor-point.copyCursorPosition',
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('没有打开的编辑器');
        return;
      }

      const document = editor.document;
      if (document.isUntitled) {
        vscode.window.showWarningMessage('请先保存文件');
        return;
      }

      const relativePath = vscode.workspace.asRelativePath(document.uri);
      const selection = editor.selection;
      const { line, character } = selection.start;

      const params: FormatParams = {
        relativePath,
        line,
        character,
      };

      if (!selection.isEmpty) {
        params.endLine = selection.end.line;
        params.endCharacter = selection.end.character;
      }

      const text = formatPosition(params);

      vscode.env.clipboard.writeText(text).then(
        () => {
          vscode.window.showInformationMessage(`已复制: ${text}`);
        },
        (err: Error) => {
          vscode.window.showErrorMessage(`复制失败: ${err.message}`);
        },
      );
    },
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

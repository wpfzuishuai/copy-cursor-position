import * as vscode from "vscode";
import { formatPosition, formatDiagnosticPosition, type TFormatParams } from "./formatPosition";
import { getDocumentInfo, getDiagnosticAtCursor } from "./utils";

export const activate = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    // Copy file:line:col (with optional selection range) to clipboard
    vscode.commands.registerCommand(
      "copy-cursor-position.copyCursorPosition",
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showWarningMessage("没有打开的编辑器");
          return;
        }
        const info = getDocumentInfo({ editor });
        if (!info) return;

        const { relativePath, selection } = info;
        const { line, character } = selection.start;

        const params: TFormatParams = selection.isEmpty
          ? { relativePath, line, character }
          : { relativePath, line, character, endLine: selection.end.line, endCharacter: selection.end.character };

        const text = formatPosition(params);
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage(`已复制: ${text}`);
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "copy-cursor-position.copyErrorForDiagnostic",
      async (
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
        const diagnostic = getDiagnosticAtCursor({ document: doc, position: pos });
        if (!diagnostic) {
          vscode.window.showInformationMessage("光标位置没有诊断信息");
          return;
        }
        const text = formatDiagnosticPosition({
          relativePath,
          line,
          character,
          ...diagnostic,
        });
        await vscode.env.clipboard.writeText(text);
        vscode.window.showInformationMessage(`已复制: ${text}`);
      },
    ),
  );

  // Inject "Copy Error with Position" link into diagnostic hover popups.
  // Passes position data via markdown command-URI to avoid a separate command palette entry.
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      { scheme: "file" },
      {
        provideHover(
          document: vscode.TextDocument,
          position: vscode.Position,
        ): vscode.Hover | undefined {
          const diagnostic = getDiagnosticAtCursor({ document, position });
          if (!diagnostic) return undefined;

          const relativePath = vscode.workspace.asRelativePath(document.uri);
          const args = JSON.stringify([
            document.uri,
            relativePath,
            position.line,
            position.character,
          ]);
          const cmdUri = `command:copy-cursor-position.copyErrorForDiagnostic?${encodeURIComponent(args)}`;

          const markdown = new vscode.MarkdownString(
            `[Copy Error with Position](${cmdUri})`,
          );
          markdown.isTrusted = true;

          return new vscode.Hover(markdown);
        },
      },
    ),
  );
};

export const deactivate = () => {};

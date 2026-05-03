# Copy Cursor Position — VS Code Extension

Copies cursor position (`file:line:col`) and diagnostic info to clipboard, formatted for AI tools and grep. Publisher: JesseWu.

## Commands & Features

| Feature                  | Trigger                         | Output Format                                        |
| ------------------------ | ------------------------------- | ---------------------------------------------------- |
| Copy Cursor Position     | `Cmd+Alt+C` / context menu      | `path:line:col` or `path:start-end` (with selection) |
| Copy Error with Position | Click link in error hover popup | `path:line:col - severity: message`                  |

## Architecture

Two source files, pure separation of formatting from VS Code glue:

- **`src/formatPosition.ts`** — Pure functions: `formatPosition(params)` and `formatDiagnosticPosition(params)`. Converts 0-based VS Code positions to 1-based output. No VS Code imports.
- **`src/extension.ts`** — Extension entry point. Registers two commands (`copyCursorPosition`, `copyErrorForDiagnostic`) and one hover provider. Handles untitled-file guard, clipboard write, and user notifications (Chinese UI messages).
- **`test/formatPosition.test.ts`** — Vitest unit tests for formatting functions.
- **`test/suite/extension.test.ts`** + **`test/runTest.ts`** — VS Code integration test via `@vscode/test-electron`.

## Scripts

| Script                     | Command                                             |
| -------------------------- | --------------------------------------------------- |
| `npm run compile`          | `tsc -p ./` (output to `out/`)                      |
| `npm test`                 | `vitest run` (unit tests only, skips `test/suite/`) |
| `npm run test:integration` | compile + run VS Code integration test              |

## Key Conventions

- VS Code positions are 0-based; output is 1-based (`line + 1`, `character + 1`).
- Untitled (unsaved) files are rejected — user must save first.
- All user-facing messages are in Chinese.
- Use `vscode.workspace.asRelativePath` for paths; workspace root is the base.
- Integration tests run with `--disable-extensions` to avoid interference.
- `.vscodeignore` excludes source and test files from the published `.vsix`.

## Dependencies

- Runtime: only VS Code `^1.85.0` (no npm runtime deps).
- Dev: `typescript ^6.0`, `vitest ^4.1`, `@vscode/test-electron`, `@vscode/vsce`.
- Package manager: pnpm (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

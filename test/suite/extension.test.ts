import * as assert from 'assert';
import * as vscode from 'vscode';

describe('Copy Cursor Position Extension', () => {
  it('should register the copyCursorPosition command', async () => {
    const commands = await vscode.commands.getCommands(true);
    const found = commands.includes('copy-cursor-point.copyCursorPosition');
    assert.ok(found, 'copy-cursor-point.copyCursorPosition command not registered');
  });
});

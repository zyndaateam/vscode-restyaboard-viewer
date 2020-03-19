import * as vscode from "vscode";

export class RestyaboardItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly id: string,
    public readonly type: string,
    public readonly tooltip?: string,
    public readonly boardId?: string,
    public readonly listId?: string,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
  }

  contextValue = `${this.type}`;
}

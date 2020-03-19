import * as vscode from "vscode";
import { RestyaboardUtils, removeTempRestyaboardFile } from "./restyaboard/RestyaboardUtils";
import { RestyaboardTreeView } from "./restyaboard/restyaboardTreeView";
import { RestyaboardCard } from "./restyaboard/restyaboardComponents";
import { RestyaboardItem } from "./restyaboard/RestyaboardItem";

export function activate(context: vscode.ExtensionContext) {
  const restyaboard = new RestyaboardUtils(context);
  const restyaboardTreeView = new RestyaboardTreeView(restyaboard);
  // Tree views
  vscode.window.registerTreeDataProvider("restyaboardTreeView", restyaboardTreeView);
  // Refresh
  vscode.commands.registerCommand("restyaboardViewer.refresh", () => restyaboardTreeView.refresh());
  // Tree View Actions - buttons
  vscode.commands.registerCommand("restyaboardViewer.authenticate", () => restyaboard.authenticate());
  vscode.commands.registerCommand("restyaboardViewer.resetCredentials", () => restyaboard.resetCredentials());
  vscode.commands.registerCommand("restyaboardViewer.showRestyaboardInfo", () => restyaboard.showRestyaboardInfo());
  // Alternative way to set credentials
  vscode.commands.registerCommand("restyaboardViewer.setCredentials", () => restyaboard.setCredentials());
  // List Actions - buttons
  vscode.commands.registerCommand("restyaboardViewer.addCard", (list: RestyaboardItem) => restyaboard.addCardToList(list));
  // Card Actions - edit
  vscode.commands.registerCommand("restyaboardViewer.editCardTitle", (card: RestyaboardItem) => restyaboard.editTitle(card));
  vscode.commands.registerCommand("restyaboardViewer.editCardDescription", (card: RestyaboardItem) =>
    restyaboard.editDescription(card)
  );
  vscode.commands.registerCommand("restyaboardViewer.addComment", (card: RestyaboardItem) => restyaboard.addComment(card));
  // Card Actions - user
  vscode.commands.registerCommand("restyaboardViewer.addSelfToCard", (card: RestyaboardItem) => restyaboard.addSelfToCard(card));
  vscode.commands.registerCommand("restyaboardViewer.removeSelfFromCard", (card: RestyaboardItem) =>
    restyaboard.removeSelfFromCard(card)
  );
  vscode.commands.registerCommand("restyaboardViewer.addUserToCard", (card: RestyaboardItem) => restyaboard.addUserToCard(card));
  vscode.commands.registerCommand("restyaboardViewer.removeUserFromCard", (card: RestyaboardItem) =>
    restyaboard.removeUserFromCard(card)
  );
  // Card Actions - card
  vscode.commands.registerCommand("restyaboardViewer.moveCardToList", (card: RestyaboardItem) => restyaboard.moveCardToList(card));
  vscode.commands.registerCommand("restyaboardViewer.archiveCard", (card: RestyaboardItem) => restyaboard.archiveCard(card));
  // Card - Show using markdown preview
  vscode.commands.registerCommand("restyaboardViewer.showCard", (card: RestyaboardCard) => restyaboard.showCard(card));
}

export function deactivate() {
  removeTempRestyaboardFile();
}

import * as vscode from "vscode";

import { RestyaboardUtils } from "./RestyaboardUtils";
import { RestyaboardItem } from "./RestyaboardItem";
import { RestyaboardObject, RestyaBoard, RestyaboardList, RestyaboardCard } from "./restyaboardComponents";

import { RESTYABOARD_ITEM_TYPE, SETTING_PREFIX, SETTING_CONFIG } from "./constants";
import { prependToLabel } from "../common/utils";

export class RestyaboardTreeView implements vscode.TreeDataProvider<RestyaboardItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<RestyaboardItem | undefined> = new vscode.EventEmitter<
    RestyaboardItem | undefined
  >();
  readonly onDidChangeTreeData: vscode.Event<RestyaboardItem | undefined> = this._onDidChangeTreeData.event;

  private restya: RestyaboardUtils;
  private restyaObject: RestyaboardObject;
  private onFirstLoad: boolean;

  constructor(restya: RestyaboardUtils) {
    this.restya = restya;
    this.restyaObject = { restyaBoards: [] };
    this.onFirstLoad = true;
  }

  refresh(): void {
    if (this.restya.isCredentialsProvided()) {
      vscode.window.showWarningMessage("Missing Credentials: please provide Your Restyaboard URL and token to use.");
      this.restyaObject = { restyaBoards: [] };
      this._onDidChangeTreeData.fire();
      vscode.commands.executeCommand("restyaboardViewer.authenticate");
      return;
    }
    const starredBoard: boolean | undefined = vscode.workspace
      .getConfiguration(SETTING_PREFIX, null)
      .get(SETTING_CONFIG.STARRED_BOARDS);
    this.restya.getBoards(starredBoard).then(boards => {
      this.restyaObject = { restyaBoards: boards };
      this._onDidChangeTreeData.fire();
    });
  }

  getTreeItem(element: RestyaboardItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RestyaboardItem): Thenable<RestyaboardItem[]> {
    if (!element) {
      if (!this.restyaObject.restyaBoards) {
        return Promise.resolve([]);
      }
      if (this.restyaObject.restyaBoards.length == 0) {
        this.refreshOnFirstLoad();
      }
      return Promise.resolve(
        this.getTreeElements(
          RESTYABOARD_ITEM_TYPE.BOARD,
          this.restyaObject.restyaBoards,
          vscode.TreeItemCollapsibleState.Collapsed
        )
      );
    } else if (element.type === RESTYABOARD_ITEM_TYPE.BOARD) {
      const boardId: string = element.id;
      const restyaBoard = this.restyaObject.restyaBoards.find((item: RestyaBoard) => item.id === boardId);
      if (!restyaBoard) {
        console.error(`Error: restyaBoard id ${boardId} not found`);
        return Promise.resolve([]);
      }
      if (!restyaBoard.restyaboardLists) {
        this.fetchListsAndUpdate(boardId, restyaBoard);
      } else {
        return Promise.resolve(
          this.getTreeElements(
            RESTYABOARD_ITEM_TYPE.LIST,
            restyaBoard.restyaboardLists,
            vscode.TreeItemCollapsibleState.Collapsed,
            boardId
          )
        );
      }
    } else if (element.type === RESTYABOARD_ITEM_TYPE.LIST) {
      const boardId: string = element.boardId || "-1";
      const listId: string = element.id || "-1";
      const restyaBoard = this.restyaObject.restyaBoards.find((item: RestyaBoard) => item.id === boardId);
      if (!restyaBoard) {
        console.error(`Error: restyaBoard id ${boardId} not found`);
        return Promise.resolve([]);
      }
      const restyaboardList = restyaBoard.restyaboardLists.find((item: RestyaboardList) => item.id === listId);
      if (!restyaboardList) {
        console.error(`Error: restyaboardList id ${listId} not found`);
        return Promise.resolve([]);
      }

      if (!restyaboardList.restyaboardCards) {
        this.fetchCardsAndUpdate(listId, restyaboardList, boardId);
      } else {
        return Promise.resolve(
          this.getTreeElements(
            RESTYABOARD_ITEM_TYPE.CARD,
            restyaboardList.restyaboardCards,
            vscode.TreeItemCollapsibleState.None,
            boardId,
            listId,
            true
          )
        );
      }
    }
    return Promise.resolve([]);
  }

  private refreshOnFirstLoad(): void {
    if (this.onFirstLoad) {
      this.refresh();
      this.onFirstLoad = false;
    }
  }

  private async fetchListsAndUpdate(boardId: string, restyaBoard: RestyaBoard): Promise<void> {
    restyaBoard.restyaboardLists = await this.restya.getListsFromBoard(boardId);
    this._onDidChangeTreeData.fire();
  }

  private async fetchCardsAndUpdate(listId: string, restyaboardList: RestyaboardList, boardId: string): Promise<void> {
    restyaboardList.restyaboardCards = await this.restya.getCardsFromList(listId, boardId);
    if (!restyaboardList.restyaboardCards.length) {
      vscode.window.showErrorMessage("No card Available..");
      return;
  }
    this._onDidChangeTreeData.fire();
  }

  private getTreeElements(
    restyaboardItemType: string,
    restyaboardObjects: Array<RestyaBoard | RestyaboardList | RestyaboardCard>,
    collapsed: vscode.TreeItemCollapsibleState = 1,
    boardId?: string,
    listId?: string,
    showCard?: boolean
  ): RestyaboardItem[] {
    return restyaboardObjects.map(obj => {
      return new RestyaboardItem(
        prependToLabel(obj.name),
        collapsed,
        obj.id,
        restyaboardItemType,
        `id: ${obj.id}`,
        boardId,
        listId,
        showCard
          ? {
              command: "restyaboardViewer.showCard",
              title: "Show Restyaboard Card",
              arguments: [obj],
            }
          : undefined
      );
    });
  }
}

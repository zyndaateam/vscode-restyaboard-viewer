import * as vscode from "vscode";
import axios from "axios";
import { writeFile, unlink } from "fs";

import { UserDataFolder } from "../common/UserDataFolder";
import {
  RestyaBoard,
  RestyaboardList,
  RestyaboardCard,
  RestyaboardChecklist,
  RestyaboardActionComment,
  CheckItem,
  RestyaboardMember,
  RestyaboardLabel
} from "./restyaboardComponents";
import { RestyaboardItem } from "./RestyaboardItem";
import {
  VSCODE_VIEW_COLUMN,
  TEMP_RESTYABOARD_FILE_NAME,
  SETTING_PREFIX,
  SETTING_CONFIG,
  GLOBALSTATE_CONFIG,
} from "./constants";

export class RestyaboardUtils {
  private globalState: any;
  private API_TOKEN: string | undefined;
  private SITE_URL: string | undefined;
  private tempRestyaboardFile: string;

  constructor(context?: vscode.ExtensionContext) {
    this.globalState = context ? context.globalState : {};
    this.tempRestyaboardFile = new UserDataFolder().getPathCodeSettings() + TEMP_RESTYABOARD_FILE_NAME || "";

    this.getCredentials();
    this.setMarkdownPreviewBreaks();
  }

  setMarkdownPreviewBreaks(): void {
    try {
      const config = vscode.workspace.getConfiguration("markdown.preview", null);
      const showPreviewBreaks = config.get<boolean>("breaks");
      if (!showPreviewBreaks) {
        config.update("breaks", true, true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  isCredentialsProvided(): boolean {
    return (!this.API_TOKEN && !this.SITE_URL);
  }

  getCredentials(): void {
    try {
      this.API_TOKEN = this.globalState.get(GLOBALSTATE_CONFIG.API_TOKEN);
      this.SITE_URL = this.globalState.get(GLOBALSTATE_CONFIG.SITE_URL);
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Error getting credentials");
    }
  }

  setRestyaboardCredential(isPassword: boolean, placeHolderText: string): Thenable<string | undefined> {
    return vscode.window.showInputBox({ ignoreFocusOut: true, password: isPassword, placeHolder: placeHolderText });
  }

  // Allows user to set api key and token directly using the vscode input box
  async setCredentials(): Promise<void> {
    try {
      const siteURL = await this.setRestyaboardCredential(false, "Your RestyaBoard URL");
      const apiToken = await this.setRestyaboardCredential(true, "Your Restyaboard API token");
      if (siteURL !== undefined) this.globalState.update(GLOBALSTATE_CONFIG.SITE_URL, siteURL);
      if (apiToken !== undefined) this.globalState.update(GLOBALSTATE_CONFIG.API_TOKEN, apiToken);
      this.getCredentials();
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Error while setting credentials");
    }
  }

  // Generates a Restyaboard API token and opens link in external browser
  async fetchApiToken(siteURL: string): Promise<void> {
    const apiTokenUrl = `${siteURL}/oauth/authorize?response_type=code&client_id=9335847554774492&scope=read%20write&state=1562312999016&redirect_uri=${siteURL}/apps/r_visualstudio/login.html`;
    try {
      vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(apiTokenUrl));
      const apiToken = await this.setRestyaboardCredential(true, "Your Restya Access token");
      if (apiToken !== undefined) this.globalState.update(GLOBALSTATE_CONFIG.API_TOKEN, apiToken);
      if (siteURL !== undefined) this.globalState.update(GLOBALSTATE_CONFIG.SITE_URL, siteURL);
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Error fetching API token");
    }
  }

  // Opens browser links for user to get Restyaboard API Key and then Token
  async authenticate(): Promise<void> {
    try {
      const siteURL = await this.setRestyaboardCredential(false, "Your RestyaBoard URL");
      if (siteURL !== undefined) {
        this.globalState.update(GLOBALSTATE_CONFIG.SITE_URL, siteURL);
        await this.fetchApiToken(siteURL);
        this.getCredentials();
      } else {
        await vscode.window.showInformationMessage(
          "Get your Restyaboard Access Token by entering your restyaboard URL");
      }

      vscode.commands.executeCommand("restyaboardViewer.refresh");
    } catch (error) {
      console.error(error);
      vscode.window.showErrorMessage("Error during authentication");
    }
  }

  // Deletes all saved info in globalstate (key, token, favouriteList)
  resetCredentials(): void {
    Object.keys(GLOBALSTATE_CONFIG).forEach(key => {
      const value: string = GLOBALSTATE_CONFIG[key];
      this.globalState.update(value, undefined);
    });
    vscode.window.showInformationMessage("Credentials have been reset");
    this.getCredentials();

    vscode.commands.executeCommand("restyaboardViewer.refresh");
  }

  showRestyaboardInfo(): void {
    this.getCredentials();
    const info = `
    API_TOKEN = ${this.API_TOKEN},
      SITE_URL = ${this.SITE_URL}
    `;
    vscode.window.showInformationMessage(info);
  }

  async showSuccessMessage(msg: string, url?: string) {
    let cardUrl;
    if (url) {
      cardUrl = await vscode.window.showInformationMessage(msg, url);
      if (cardUrl) {
        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(cardUrl));
      }
    } else {
      vscode.window.showInformationMessage(msg);
    }
  }

  async restyaboardApiGetRequest(url: string, params: object): Promise<any> {
    try {
      axios.defaults.baseURL = this.SITE_URL;
      const res = await axios.get(url, { params });
      return (res.data.data)? res.data.data: [];
    } catch (error) {
      if (error.response) {
        console.error("GET error", error.response);
        vscode.window.showErrorMessage(`HTTP error: ${error.response.status} - ${error.response.data}`);
      }
    }
    return null;
  }
  async restyaboardApiSingleGetRequest(url: string, params: object): Promise<any> {
    try {
      axios.defaults.baseURL = this.SITE_URL;
      const res = await axios.get(url, { params });
      return res.data;
    } catch (error) {
      if (error.response) {
        console.error("GET error", error.response);
        vscode.window.showErrorMessage(`HTTP error: ${error.response.status} - ${error.response.data}`);
      }
    }
    return null;
  }

  async restyaboardApiPostRequest(url: string, data: object): Promise<any> {
    try {
      axios.defaults.baseURL = this.SITE_URL;
      const res = await axios.post(url, data);
      return res;
    } catch (error) {
      if (error.response) {
        console.error("POST error", error.response);
        vscode.window.showErrorMessage(`HTTP error: ${error.response.status} - ${error.response.data}`);
      }
    }
    return null;
  }

  async restyaboardApiPutRequest(url: string, data: object): Promise<any> {
    try {
      axios.defaults.baseURL = this.SITE_URL;
      const res = await axios.put(url, data);
      return res.data;
    } catch (error) {
      if (error.response) {
        console.error("PUT error", error.response);
        vscode.window.showErrorMessage(`HTTP error: ${error.response.status} - ${error.response.data}`);
      }
    }
    return null;
  }

  async restyaboardApiDeleteRequest(url: string, params: object): Promise<any> {
    try {
      axios.defaults.baseURL = this.SITE_URL;
      const res = await axios.delete(url, { params });
      return res.data;
    } catch (error) {
      if (error.response) {
        console.error("DELETE error", error.response);
        vscode.window.showErrorMessage(`HTTP error: ${error.response.status} - ${error.response.data}`);
      }
    }
    return null;
  }

  async getBoardById(boardId: string): Promise<RestyaBoard> {
    const res = await this.restyaboardApiSingleGetRequest(`/api/v1/boards/${boardId}.json`, {
      token: this.API_TOKEN,
    });
    return res;
  }

  async getListById(listId: string): Promise<RestyaboardList> {
    const list = await this.restyaboardApiGetRequest(`/api/v1/lists/${listId}`, {
      token: this.API_TOKEN,
    });
    return list;
  }

  getBoards(starredBoards?: boolean): Promise<RestyaBoard[]> {
    const res = this.restyaboardApiGetRequest("/api/v1/boards.json", {
      filter: starredBoards ? "starred" : "all",
      type: 'simple',
      token: this.API_TOKEN,
    });
    console.log(JSON.stringify(res));
    return res;
  }

  getListsFromBoard(boardId: string): Promise<RestyaboardList[]> {
    const res = this.restyaboardApiGetRequest(`/api/v1/boards/${boardId}/lists.json`, {
      token: this.API_TOKEN,
    });
    return res;
  }


  getCardsFromList(listId: string, boardId: string): Promise<RestyaboardCard[]> {
    const res = this.restyaboardApiGetRequest(`/api/v1/boards/${boardId}/lists/${listId}/cards.json`, {
      token: this.API_TOKEN,
    });
    return res;
  }

  getCardById(cardId: string, boardId: string  | undefined, listId: string  | undefined): Promise<RestyaboardCard> {
    const res = this.restyaboardApiSingleGetRequest(`/api/v1/boards/${boardId}/lists/${listId}/cards/${cardId}.json`, {
      token: this.API_TOKEN,
    });
    return res;
  }
  getcardComments(cardId: string, boardId: string  | undefined, listId: string  | undefined): Promise<RestyaboardCard> {
    const res = this.restyaboardApiGetRequest(`/api/v1/boards/${boardId}/lists/${listId}/cards/${cardId}/activities.json`, {
      token: this.API_TOKEN,
      view:'modal_card',
      mode:'comment'
    });
    return res;
  }
  

  async addCardToList(list: RestyaboardItem): Promise<Number> {
    if (!list) {
      vscode.window.showErrorMessage("Could not get valid list");
      return 1;
    }
    const cardName = await vscode.window.showInputBox({ ignoreFocusOut: true, placeHolder: "Enter name of card" });
    if (cardName === undefined) return 2;

    const resData = await this.restyaboardApiPostRequest(`/api/v1/boards/${list.boardId}/lists/${list.id}/cards.json?token=${this.API_TOKEN}`, {
      list_id: list.id,
      name: cardName,
      is_offline:true,
      board_id:list.boardId,
    });

    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    let card_url = this.SITE_URL+'/#/board/'+list.boardId+'/card/'+resData.data.activity.card_id;
    this.showSuccessMessage(`Created Card: ${resData.data.activity.card_id}-${resData.data.activity.card_name}`, card_url);
    return 0;
  }

  async editTitle(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid card");
      return 1;
    }
    const restyaboardCard: RestyaboardCard = await this.getCardById(card.id, card.boardId, card.listId);
    const name = await vscode.window.showInputBox({ ignoreFocusOut: true, value: restyaboardCard.title });
    if (name === undefined) return 2;
    const resData = await this.restyaboardApiPutRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}.json?token=${this.API_TOKEN}`, {
      name,
    });

    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Updated title for card: ${name}`);
    return 0;
  }

  async editDescription(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid card");
      return 1;
    }
    const restyaboardCard: RestyaboardCard = await this.getCardById(card.id, card.boardId, card.listId);
    // parse new line chars and remove quotes from start and end
    let descRaw = JSON.stringify(restyaboardCard.description);
    descRaw = descRaw.slice(1, descRaw.length - 1);

    const descUpdated = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      value: descRaw,
      placeHolder: "Enter description for card",
    });
    if (descUpdated === undefined) return 2;

    // replaces "\n" with javascript return character required for Restyaboard api
    const description = descUpdated.replace(/\\n/g, "\x0A");
    const resData = await this.restyaboardApiPutRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}.json?token=${this.API_TOKEN}`, {
      description,
    });
    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Updated description for card: ${resData.activity.description}`);
    return 0;
  }

  async addComment(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid card");
      return 1;
    }
    const user: any = await this.getSelf();    
    const comment = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Add comment",
    });
    if (comment === undefined) return 2;

    const resData = await this.restyaboardApiPostRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}/comments.json?token=${this.API_TOKEN}`, {
      board_id:card.boardId,
      card_id:card.id,
      is_offline:true,
      list_id:card.listId,
      user_id:user.id,
      comment: comment,
    });
    
    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Added comment to card: ${card.label}`);
    return 0;
  }

  private getSelf(): Promise<RestyaboardMember> {
    return this.restyaboardApiSingleGetRequest(`/api/v1/users/me.json`, {
      token: this.API_TOKEN,
    });
  }

  async addSelfToCard(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid Card");
      return 1;
    }
    const user: any = await this.getSelf();    
    const resData = await this.restyaboardApiPostRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}/users/${user.id}.json?token=${this.API_TOKEN}`, {
      card_id: card.id,
      user_id: user.id,
    });
    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Added user ${user.user.initials} to card`);
    return 0;
  }

  async removeSelfFromCard(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid Card");
      return 1;
    }
    const user: any = await this.getSelf();
    const usersOnCard = await this.getCardById(card.id, card.boardId, card.listId);
    if (!usersOnCard.cards_users && !usersOnCard.cards_users.length) {
      vscode.window.showErrorMessage("Card not assigned to you!.");
      return 3;
    } 
    let removeUser = usersOnCard.cards_users.find((useroncard: any) => useroncard.user_id == user.id);
    if (!removeUser){
      vscode.window.showErrorMessage("Card not assigned to you!.");
      return 3;
    } 
    const resData = await this.restyaboardApiDeleteRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}/cards_users/${removeUser.id}.json`, {
      token: this.API_TOKEN,
    });

    if (!resData) return 3;
    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Removed user ${user.user.initials} from card`);
    return 0;
  }

  async addUserToCard(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid Card");
      return 1;
    }
    const board_details = await this.getBoardById(card.boardId || "-1"); 
    const usersOnBoard =  board_details.boards_users;
    if (!usersOnBoard) return 3;

    const quickPickUsers = usersOnBoard.map((user: any) => {
      return {
        label: user.full_name,
        userId: user.user_id,
      };
    });
    const addUser : any = await vscode.window.showQuickPick(quickPickUsers, { placeHolder: "Add user from board:" });
    if (addUser === undefined) return 2;
    const resData = await this.restyaboardApiPostRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}/users/${addUser.userId}.json?token=${this.API_TOKEN}`, {
      card_id: card.id,
      user_id: addUser.userId,
    });

    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Added user ${addUser.label} to card`);
    return 0;
  }

  async removeUserFromCard(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid Card");
      return 1;
    }

    const usersOnCard = await this.getCardById(card.id, card.boardId, card.listId);
    if (!usersOnCard) return 3;

    const quickPickUsers = usersOnCard.cards_users.map((user: any) => {
      return {
        label: user.full_name,
        userId: user.id,
      };
    });
    const removeUser : any = await vscode.window.showQuickPick(quickPickUsers, { placeHolder: "Remove user from board:" });
    if (removeUser === undefined) return 2;
    
    const resData = await this.restyaboardApiDeleteRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}/cards_users/${removeUser.userId}.json`, {
      token: this.API_TOKEN,
    });
    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Removed user ${removeUser.label} from card`);
    return 0;
  }

  async moveCardToList(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid card");
      return 1;
    }
    const listsForBoard = await this.getListsFromBoard(card.boardId || "-1");
    if (!listsForBoard) return 3;

    const quickPickLists = listsForBoard.map(list => {
      return {
        label: list.name,
        listId: list.id,
      };
    });
    const restyaboardCard: RestyaboardCard = await this.getCardById(card.id, card.boardId, card.listId);
    const toList = await vscode.window.showQuickPick(quickPickLists, { placeHolder: "Move card to list:" });
    if (toList === undefined) return 2;

    const resData = await this.restyaboardApiPutRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}.json?token=${this.API_TOKEN}`, {
      list_id: toList.listId,
      board_id:card.boardId,
      position:restyaboardCard.position
    });
    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    this.showSuccessMessage(`Moved card to list: ${toList.label}`);
    return 0;
  }

  async archiveCard(card: RestyaboardItem): Promise<Number> {
    if (!card) {
      vscode.window.showErrorMessage("Could not get valid card");
      return 1;
    }
    const resData = await this.restyaboardApiPutRequest(`/api/v1/boards/${card.boardId}/lists/${card.listId}/cards/${card.id}.json?token=${this.API_TOKEN}`, {
      is_archived: 1,
    });

    if (!resData) return 3;

    vscode.commands.executeCommand("restyaboardViewer.refresh");
    let card_url = this.SITE_URL+'/#/board/'+card.boardId+'/card/'+resData.activity.card_id;
    this.showSuccessMessage(`Archived Card: ${resData.activity.card_id}-${resData.activity.card_name}`, card_url);
    return 0;
  }

  showCardMembersAsString(members: RestyaboardMember[]): string {
    if (!members || members.length == 0) {
      return "";
    }
    return members.map(member => member.initials).join(", ");
  }
  showCardLabelsAsString(labels: RestyaboardLabel[]): string {
    if (!labels || labels.length == 0) {
      return "";
    }
    return labels.map(label => label.name).join(", ");
  }

  showChecklistsAsMarkdown(checklists: RestyaboardChecklist[]): string {
    if (!checklists || checklists.length == 0) {
      return "";
    }

    let checklistMarkdown: string = "";
    checklists.map(checklist => {
      checklistMarkdown += `\n> ${checklist.name}\n\n`;
      checklist.checklists_items
        .sort((checkItem1: CheckItem, checkItem2: CheckItem) => checkItem1.position - checkItem2.position)
        .map((checkItem: CheckItem) => {
          checklistMarkdown +=
            checkItem.is_completed == "1" ? `✅ ~~${checkItem.name}~~  \n` : `🔳 ${checkItem.name}  \n`;
        });
    });
    return checklistMarkdown;
  }

  showCommentsAsMarkdown(comments: RestyaboardActionComment[]): string {
    if (!comments || comments.length == 0) {
      return "";
    }

    let commentsMarkdown: string = "";
    comments.map((comment: RestyaboardActionComment) => {
      const date = new Date(comment.created);
      const dateString = `${date.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`;
      const timeString = `${date.toLocaleString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
      let depth_string: string = "";
      for(let i=0; i<=comment.depth; i++){
         depth_string += '>';
      }
      commentsMarkdown += `\n${depth_string} ${comment.full_name} - ${dateString} at ${timeString} ${
        comment.revisions ? "(edited)" : ""
      } \n`;
      commentsMarkdown += `\n\n${comment.comment}\n\n`;
    });
    return commentsMarkdown;
  }

  showMarkdownDecorated(header: string, content: string | undefined): string {
    return content ? `## **\`${header}\`** \n${content}\n\n--- \n` : "";
  }

  async showCard(card: RestyaboardCard): Promise<void> {
    if (!card) {
      vscode.window.showErrorMessage("No card selected or invalid card.");
      return;
    }
    let Cardcomments: any = await this.getcardComments(card.id, card.board_id, card.list_id);
    const cardMembers: string = this.showCardMembersAsString(card.cards_users);
    const cardLabels: string = this.showCardLabelsAsString(card.cards_labels);
    const checklistItems: string = this.showChecklistsAsMarkdown(card.cards_checklists);
    const commentItems: string = this.showCommentsAsMarkdown(Cardcomments);
    const cardCoverImageUrl = !!card.attachments && card.attachments.length > 0 ? card.attachments[0].url : "";
    const cardContentAndHeaders = [
      { header: "URL", content: card.url },
      { header: "Title", content: card.name },
      { header: "Board Name", content: card.board_name },
      { header: "List Name", content: card.list_name },
      { header: "Members", content: cardMembers },
      { header: "Labels", content: cardLabels },
      { header: "Description", content: card.description },
      { header: "Checklists", content: checklistItems },
      { header: "Comments", content: commentItems },
    ];
    if(card.due_date){
      cardContentAndHeaders.push( { header: "Due Date", content: card.due_date });
    }
    let cardContent: string = "";
    // cardContent += "| Board Name  | List Name |\n| ------------- | ------------- |\n| "+card.board_name+"  | "+card.list_name+"  |\n";
    cardContentAndHeaders.map(({ header, content }) => {
      cardContent += this.showMarkdownDecorated(header, content);
    });
    cardContent += cardCoverImageUrl ? `<img src="${cardCoverImageUrl}" alt="Image not found" />` : "";
    
    // Write temp markdown file at user's vs code default settings directory
    writeFile(this.tempRestyaboardFile, cardContent, err => {
      if (err) {
        vscode.window.showErrorMessage(`Error writing to temp file: ${err}`);
      }
      console.info(`✍ Writing to file: ${this.tempRestyaboardFile}`);
    });

    // open markdown file and preview view
    let viewColumn: vscode.ViewColumn =
      vscode.workspace.getConfiguration(SETTING_PREFIX, null).get(SETTING_CONFIG.VIEW_COLUMN) ||
      SETTING_CONFIG.DEFAULT_VIEW_COLUMN;
    if (!(VSCODE_VIEW_COLUMN.indexOf(viewColumn) > -1)) {
      vscode.window.showInformationMessage(`Invalid ${SETTING_PREFIX}.viewColumn ${viewColumn} specified`);
      viewColumn = SETTING_CONFIG.DEFAULT_VIEW_COLUMN;
    }

    const doc = await vscode.workspace.openTextDocument(this.tempRestyaboardFile);
    await vscode.window.showTextDocument(doc, viewColumn, false);
    await vscode.commands.executeCommand("markdown.showPreview");
    vscode.commands.executeCommand("markdown.preview.toggleLock");
  }
}

export function removeTempRestyaboardFile() {
  const userDataFolder = new UserDataFolder();
  const tempRestyaboardFile = userDataFolder.getPathCodeSettings() + TEMP_RESTYABOARD_FILE_NAME;
  unlink(tempRestyaboardFile, err => {
    if (err) throw err;
    console.info(`❌ Deleted file: ${tempRestyaboardFile}`);
  });
}

import { GlobalStateConfig } from "./restyaboardComponents";

export const VSCODE_VIEW_COLUMN = [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const TEMP_RESTYABOARD_FILE_NAME = "~vscodeRestyaboard.md";

export const SETTING_PREFIX = "restyaboardViewer";

export const SETTING_CONFIG = {
  VIEW_COLUMN: "viewColumn",
  DEFAULT_VIEW_COLUMN: 2,
  STARRED_BOARDS: "starredBoardsOnly",
  DEFAULT_STARRED_BOARDS: true,
};

export const GLOBALSTATE_CONFIG: GlobalStateConfig = {
  API_KEY: "restyaboardViewerApiKey",
  SITE_URL: "restyaboardViewerSiteURL",
  API_TOKEN: "restyaboardViewerApiToken",
};

export const RESTYABOARD_ITEM_TYPE = {
  BOARD: "board",
  LIST: "list",
  CARD: "card",
};
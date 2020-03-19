export interface RestyaboardObject {
  restyaBoards: RestyaBoard[];
}

export interface RestyaBoard {
  id: string;
  name: string;
  restyaboardLists: RestyaboardList[];
  boards_users:any;
  [key: string]: any;
}

export interface RestyaboardList {
  id: string;
  name: string;
  idBoard: string;
  restyaboardCards: RestyaboardCard[];
  [key: string]: any;
}

export interface RestyaboardCard {
  id: string;
  idShort: string;
  idBoard: string;
  idList: string;
  name: string;
  attachments: Array<{
    url: string;
  }>;
  url: string;
  desc: string;
  idChecklists: string[];
  restyaboardChecklists: RestyaboardChecklist[];
  actions: RestyaboardActionComment[];
  members: RestyaboardMember[];
  [key: string]: any;
}

export interface RestyaboardMember {
  id: string;
  initials: string;
  full_name: string;
}
export interface RestyaboardLabel {
  id: string;
  name: string;
}

export interface RestyaboardActionComment {
  id: string;
  date: string;
  data: {
    text: string;
    dateLastEdited: string;
  };
  memberCreator: {
    fullName: string;
  };
  [key: string]: any;
}

export interface RestyaboardChecklist {
  id: string;
  name: string;
  checkItems: CheckItem[];
  [key: string]: any;
}

export interface CheckItem {
  id: string;
  state: string;
  name: string;
  pos: number;
  [key: string]: any;
}

export interface GlobalStateConfig {
  API_KEY: string;
  API_TOKEN: string;
  SITE_URL: string;
  [key: string]: string;
}

export interface Board {
  id: string;
  name: string;
  ownerUserId: string;
  memberIds: string[];
  membersCount: number;
  lists: List[];
  lastUpdate: string;
}

export interface List {
  id: string;
  name: string;
  boardId: string;
  position: number;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  listId: string;
  position: number;
}

export interface User {
  id: string;
}

export interface CreateBoardRequest {
  name: string;
  ownerUserId: string;
}

export interface CreateListRequest {
  name: string;
}

export interface CreateCardRequest {
  title: string;
  description: string;
}

export interface UpdateCardRequest {
  title: string;
  description: string;
}

export interface MoveCardRequest {
  targetListId: string;
  targetPosition: number;
}

export interface AddMemberRequest {
  userId: string;
}
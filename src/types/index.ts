export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  createdAt: number;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  order: number;
  createdAt: number;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: number;
}

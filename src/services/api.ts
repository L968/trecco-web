import {
  Board,
  CreateBoardRequest,
  CreateListRequest,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  AddMemberRequest,
  BoardActionLog
} from '../types';

const API_BASE_URL = 'https://localhost:7035';

class ApiService {
  private getHeaders(userId?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userId) {
      headers['X-User-Id'] = userId;
    }

    return headers;
  }

  async getUserBoards(userId: string): Promise<Board[]> {
    const response = await fetch(`${API_BASE_URL}/boards/me`, {
      headers: this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getBoard(boardId: string, userId: string): Promise<Board> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}`, {
      headers: this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async getBoardLogs(boardId: string, userId: string): Promise<BoardActionLog[]> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/action-logs`, {
      headers: this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createBoard(request: CreateBoardRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async createList(boardId: string, request: CreateListRequest, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async deleteList(boardId: string, listId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async createCard(boardId: string, listId: string, request: CreateCardRequest, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/lists/${listId}/cards`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async updateCard(boardId: string, cardId: string, request: UpdateCardRequest, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/cards/${cardId}`, {
      method: 'PUT',
      headers: this.getHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async deleteCard(boardId: string, cardId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/cards/${cardId}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async moveCard(boardId: string, cardId: string, request: MoveCardRequest, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/cards/${cardId}/move`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async addMember(boardId: string, request: AddMemberRequest, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/members`, {
      method: 'POST',
      headers: this.getHeaders(userId),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async removeMember(boardId: string, memberUserId: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/boards/${boardId}/members/${memberUserId}`, {
      method: 'DELETE',
      headers: this.getHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
}

export const apiService = new ApiService();

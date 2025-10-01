import * as signalR from '@microsoft/signalr';

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private handlersRegistered = false;
  private connecting = false;

  async connect(boardId: string, userId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.connecting) {
      return;
    }

    this.connecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`https://localhost:7035/hubs/board?boardId=${boardId}&userId=${userId}`)
        .withAutomaticReconnect()
        .build();

      this.setupEventHandlers();

      await this.connection.start();
      console.log('SignalR connected successfully');
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    } finally {
      this.connecting = false;
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection || this.handlersRegistered) return;

    this.connection.on(
      'CardMoved',
      (cardId: string, listId: string, position: number, fromUserId: string) => {
        console.log(
          'SignalR notification received for board. Card moved:',
          { cardId, listId, position, fromUserId }
        );

        window.dispatchEvent(
          new CustomEvent('signalr-card-moved', {
            detail: { cardId, listId, position, userId: fromUserId },
          })
        );
      }
    );

    this.connection.on(
      'BoardLogged',
      (id: string, userId: string, details: string, timestamp: string) => {
        console.log('SignalR BoardLogged recebido:', { id, userId, details, timestamp });

        window.dispatchEvent(
          new CustomEvent('signalr-board-logged', {
            detail: { id, userId, details, timestamp },
          })
        );
      }
    );

    this.connection.onclose((error) => {
      console.log('SignalR connection closed:', error);
    });

    this.connection.onreconnecting((error) => {
      console.log('SignalR reconnecting:', error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('SignalR reconnected:', connectionId);
    });

    this.handlersRegistered = true;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.handlersRegistered = false;
      console.log('SignalR disconnected');
    }
  }

  async leaveBoard(boardId: string): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      await this.connection.invoke('LeaveBoard', boardId);
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }
}

export const signalRService = new SignalRService();

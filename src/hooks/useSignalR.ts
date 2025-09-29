import { useEffect, useState, useCallback } from 'react';
import { signalRService } from '../services/signalr';
import { useAuth } from '../contexts/AuthContext';

export function useSignalR(boardId: string | undefined) {
  const { userId } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(async function() {
    if (!boardId || !userId || isConnected) return;

    try {
      await signalRService.connect(boardId, userId);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to SignalR:', error);
      setIsConnected(false);
    }
  }, [boardId, userId, isConnected]);

  const disconnect = useCallback(async function() {
    if (signalRService.isConnected()) {
      await signalRService.disconnect();
      setIsConnected(false);
    }
  }, []);

  const leaveBoard = useCallback(async function() {
    if (boardId && signalRService.isConnected()) {
      await signalRService.leaveBoard(boardId);
    }
  }, [boardId]);

  useEffect(() => {
    (async () => {
      await connect();
    })();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionState: signalRService.getConnectionState(),
    leaveBoard,
    connect,
    disconnect
  };
}

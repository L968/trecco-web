import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BoardActionLog } from '../types';

interface BoardLogsPanelProps {
  boardId: string;
  className?: string;
}

export function BoardLogsPanel({ boardId, className = '' }: BoardLogsPanelProps): React.ReactElement {
  const [logs, setLogs] = useState<BoardActionLog[]>([]);
  const { execute } = useApi();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, userId]);

  useEffect(() => {
    function handleBoardLogged(event: CustomEvent) {
      const log = event.detail as BoardActionLog;
      setLogs(prev => [log, ...prev]);
    }

    window.addEventListener('signalr-board-logged', handleBoardLogged as EventListener);
    return () => window.removeEventListener('signalr-board-logged', handleBoardLogged as EventListener);
  }, []);

  async function loadLogs() {
    if (!userId) return;
    const result = await execute(() => apiService.getBoardLogs(boardId, userId));
    if (result) {
      const ordered = result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setLogs(ordered);
    }
  }

  return (
    <div className={`flex flex-col bg-slate-800  overflow-y-auto ${className}`}>
      <div className="px-4 py-3 border-b border-slate-700">
        <h2 className="text-sm font-semibold text-gray-100">Activity</h2>
      </div>

      <div className="px-4 py-3 overflow-y-auto flex-1">
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <ul className="space-y-3">
            {logs.map(log => (
              <li key={log.id} className="bg-slate-700 p-3 rounded-lg shadow">
                <p className="text-sm text-gray-200 break-words">{log.details}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

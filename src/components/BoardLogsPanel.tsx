import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BoardActionLog, Paginated } from '../types';

interface BoardLogsPanelProps {
  boardId: string;
  pageSize?: number;
}

export function BoardLogsPanel({
  boardId,
  pageSize = 10
}: BoardLogsPanelProps): React.ReactElement {
  const [logs, setLogs] = useState<BoardActionLog[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { execute } = useApi();
  const { userId } = useAuth();

  useEffect(() => {
    if (!userId) return;
    loadLogs(1, true);
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

  async function loadLogs(targetPage: number, replace: boolean = false) {
    if (!userId || loading) return;
    setLoading(true);

    try {
      const paginated: Paginated<BoardActionLog> | null = await execute(() =>
        apiService.getBoardLogs(boardId, userId, targetPage, pageSize)
      );

      if (paginated && paginated.items.length > 0) {
        setLogs(prev => (replace ? paginated.items : [...prev, ...paginated.items]));
        setPage(targetPage);
        setHasMore(paginated.items.length === pageSize);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLoadMore() {
    loadLogs(page + 1);
  }

  return (
    <div className="w-80 flex min-h-0 flex-col bg-slate-800 overflow-y-auto">
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

        {hasMore && (
          <div className="flex justify-center mt-3">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500 text-gray-100 transition-colors text-sm"
            >
              {loading ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

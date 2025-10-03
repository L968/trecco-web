import React, { useEffect, useState } from 'react';
import { Users, Clock, LogOut, Wifi, WifiOff, MoreVertical, Trash } from 'lucide-react';
import { Board } from '../types';
import { MembersModal } from './MembersModal';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BoardHeaderProps {
  board: Board;
  onRefresh: () => void;
  isConnected?: boolean;
  onLeaveBoard?: () => Promise<void>;
}

export function BoardHeader({
  board,
  onRefresh,
  isConnected = false,
  onLeaveBoard
}: BoardHeaderProps): React.ReactElement {
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [, tick] = useState(0);

  const { userId: currentUserId } = useAuth();
  const { execute } = useApi();
  const navigate = useNavigate();

  const isOwner = currentUserId === board.ownerUserId;

  useEffect(() => {
    const interval = setInterval(() => tick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  function formatLastUpdate(lastUpdate: string) {
    try {
      const date = new Date(lastUpdate);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  async function handleLeaveBoard() {
    if (currentUserId && currentUserId !== board.ownerUserId) {
      if (onLeaveBoard) await onLeaveBoard();
      await execute(() => apiService.removeMember(board.id, currentUserId, currentUserId));
      navigate('/');
    }
  }

  function canLeaveBoard() {
    return currentUserId && currentUserId !== board.ownerUserId;
  }

  async function handleDeleteBoard() {
    if (!currentUserId) return;
    await execute(() => apiService.deleteBoard(board.id, currentUserId));
    setShowDeleteModal(false);
    navigate('/');
  }

  return (
    <div className="bg-slate-700 border-b border-slate-600 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Board name */}
        <h2 className="text-lg font-semibold text-gray-100">{board.name}</h2>

        {/* Board info */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowMembersModal(true)}
            className="flex items-center space-x-2 text-gray-200 text-sm bg-purple-800 px-3 py-1 rounded-full hover:bg-purple-700 transition-colors cursor-pointer"
          >
            <Users className="h-4 w-4" />
            <span>{(board.memberIds?.length || 0) + 1} members</span>
          </button>

          <div
            className="flex items-center space-x-2 text-gray-400 text-sm bg-blue-900 px-3 py-1 rounded-full"
            title={board.ownerUserId}
          >
            <span className="text-blue-300">Owner:</span>
            <span className="text-blue-200 font-medium">{board.ownerUserId?.substring(0, 8)}...</span>
          </div>

          <div className="flex items-center space-x-2 text-gray-400 text-sm bg-green-900 px-3 py-1 rounded-full">
            <Clock className="h-4 w-4 text-green-400" />
            <span className="text-green-300">Updated:</span>
            <span className="text-green-200 font-medium">{formatLastUpdate(board.lastUpdate)}</span>
          </div>

          {/* SignalR Connection Status */}
          <div
            className={`flex items-center space-x-2 text-sm px-3 py-1 rounded-full ${isConnected ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
              }`}
          >
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span className={isConnected ? 'text-green-300' : 'text-red-300'}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          {/* Leave Board */}
          {canLeaveBoard() && (
            <button
              onClick={handleLeaveBoard}
              className="flex items-center space-x-2 px-3 py-1 rounded-full text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Board</span>
            </button>
          )}

          {/* Owner Dropdown Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(prev => !prev)}
                className="p-1 rounded hover:bg-slate-600 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-300" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded-t-lg"
                  >
                    <Trash className="w-4 h-4" />
                    <span>Delete Board</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <MembersModal board={board} onClose={() => setShowMembersModal(false)} onRefresh={onRefresh} />
      )}

      {/* Delete Board Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-xl border border-slate-700">
            <div className="flex items-center space-x-2 mb-4">
              <Trash className="w-5 h-5 text-red-500" />
              <span className="text-lg font-semibold text-gray-100">Delete Board</span>
            </div>
            <p className="text-gray-300 mb-4">
              To confirm deletion, please type <strong>delete</strong> in the box below. This action cannot be undone.
            </p>
            <input
              type="text"
              className="w-full px-3 py-2 rounded bg-slate-700 text-gray-100 border border-slate-600 mb-4"
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmInput('');
                }}
                className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500 text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBoard}
                disabled={confirmInput.toLowerCase() !== 'delete'}
                className={`px-4 py-2 rounded text-white ${confirmInput.toLowerCase() === 'delete'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-red-900 cursor-not-allowed'
                  } flex items-center space-x-2`}
              >
                <span>Delete Board</span>
                <span className="text-red-200">💀</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

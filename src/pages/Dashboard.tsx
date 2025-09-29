import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Board } from '../types';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { CreateBoardModal } from '../components/CreateBoardModal';
import { Header } from '../components/Header';

export function Dashboard(): React.ReactElement {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { userId } = useAuth();
  const { execute, loading } = useApi();
  const navigate = useNavigate();

  async function loadBoards() {
    if (userId) {
      const result = await execute(() => apiService.getUserBoards(userId));
      if (result) {
        setBoards(result);
      }
    }
  }

  useEffect(() => {
    loadBoards();
  }, [userId]);

  async function handleCreateBoard(name: string) {
    if (userId) {
      await execute(() => apiService.createBoard({ name, ownerUserId: userId }));
      setShowCreateModal(false);
      loadBoards();
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">Your Boards</h2>
          <p className="text-gray-400">Manage your projects and collaborate with your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create Board Card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-32 card border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-slate-500 hover:bg-slate-700 transition-colors group"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-slate-400 group-hover:text-slate-300 mx-auto mb-2" />
              <span className="text-slate-400 group-hover:text-slate-200 font-medium">Create New Board</span>
            </div>
          </button>

          {/* Board Cards */}
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            </div>
          ) : (
            boards.map((board) => (
              <button
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="h-32 card card-hover p-4 text-left"
              >
                <div>
                  <h3 className="font-semibold text-lg mb-2 truncate text-gray-100">{board.name}</h3>
                  <div className="text-gray-400 text-sm">
                    <p>{(board.membersCount || 0) + 1} members</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { X, Users, User, UserPlus, Trash2 } from 'lucide-react';
import { Board } from '../types';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

interface MembersModalProps {
  board: Board;
  onClose: () => void;
  onRefresh: () => void;
}

export function MembersModal({ board, onClose, onRefresh }: MembersModalProps): React.ReactElement {
  const [showAddMember, setShowAddMember] = useState(false);
  const [userId, setUserId] = useState('');
  const { userId: currentUserId } = useAuth();
  const { execute } = useApi();

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (userId.trim() && currentUserId) {
      await execute(() => apiService.addMember(board.id, { userId: userId.trim() }, currentUserId));
      setUserId('');
      setShowAddMember(false);
      onRefresh();
    }
  }

  function generateUserId() {
    const newUserId = crypto.randomUUID();
    setUserId(newUserId);
  }

  async function handleRemoveMember(memberId: string) {
    if (currentUserId) {
      await execute(() => apiService.removeMember(board.id, memberId, currentUserId));
      onRefresh();
    }
  }

  function canRemoveMember(memberId: string) {
    if (!currentUserId) return false;
    
    return currentUserId === board.ownerUserId && memberId !== board.ownerUserId;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-100">Board Members</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!showAddMember ? (
          <div className="space-y-3">
            {/* Owner */}
            <div className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border border-blue-700">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-blue-400" />
                <div>
                  <div className="text-blue-200 font-medium">Owner</div>
                  <div className="text-blue-300 text-sm font-mono">{board.ownerUserId}</div>
                </div>
              </div>
              {canRemoveMember(board.ownerUserId) && (
                <button
                  onClick={() => handleRemoveMember(board.ownerUserId)}
                  className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                  title="Remove member"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Members */}
            {board.memberIds && board.memberIds.length > 0 ? (
              board.memberIds.map((memberId) => (
                <div key={memberId} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div className="text-gray-200 font-mono text-sm">{memberId}</div>
                  </div>
                  {canRemoveMember(memberId) && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No members added yet</p>
              </div>
            )}

            {/* Add Member Button */}
            <button
              onClick={() => setShowAddMember(true)}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-900 hover:bg-purple-800 rounded-lg transition-colors text-purple-200"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddMember} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
                User ID (GUID)
              </label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user GUID or generate a new one"
                className="input-field"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={generateUserId}
                className="flex-1 btn-secondary"
              >
                Generate New ID
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Add Member
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="w-full btn-secondary"
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

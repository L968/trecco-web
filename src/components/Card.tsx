import React, { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Card as CardType } from '../types';
import { EditCardModal } from './EditCardModal';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

interface CardProps {
  card: CardType;
  boardId: string;
  onDragStart: () => void;
  onRefresh: () => void;
}

export function Card({ card, boardId, onDragStart, onRefresh }: CardProps): React.ReactElement {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { userId } = useAuth();
  const { execute } = useApi();

  function handleDragStart(e: React.DragEvent) {
    onDragStart();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);

    const target = e.target as HTMLElement;
    target.style.opacity = '0.6';
  }

  function handleDragEnd(e: React.DragEvent) {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
  }

  async function handleEdit(title: string, description: string) {
    if (userId) {
      await execute(() =>
        apiService.updateCard(boardId, card.id, { title, description }, userId)
      );
      setShowEditModal(false);
      onRefresh();
    }
  }

  async function handleDelete() {
    if (userId && window.confirm('Are you sure you want to delete this card?')) {
      await execute(() => apiService.deleteCard(boardId, card.id, userId));
      onRefresh();
    }
  }

  return (
    <>
      <div
        data-card
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className="bg-slate-700 border border-slate-600 rounded-lg p-3 shadow-md hover:shadow-lg transition-all duration-200 cursor-move relative group hover:border-slate-500 hover:bg-slate-650 select-none"
        style={{ transition: 'all 0.2s ease-in-out' }}
      >
        {/* Card Actions */}
        {showActions && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1 text-gray-400 hover:text-cyan-400 hover:bg-gray-600 rounded"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Card Content */}
        <h3 className="font-medium text-white mb-2 pr-8">{card.title}</h3>
        {card.description && (
          <p className="text-sm text-gray-300 line-clamp-3">{card.description}</p>
        )}
      </div>

      {/* Edit Card Modal */}
      {showEditModal && (
        <EditCardModal
          card={card}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
    </>
  );
};
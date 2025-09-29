import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { List as ListType } from '../types';
import { Card } from './Card';
import { CreateCardModal } from './CreateCardModal';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

interface ListProps {
  list: ListType;
  boardId: string;
  onCardDragStart: (cardId: string, listId: string) => void;
  onCardDrop: (listId: string, position: number) => void;
  onRefresh: () => void;
}

export function List({
  list,
  boardId,
  onCardDragStart,
  onCardDrop,
  onRefresh
}: ListProps): React.ReactElement {
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuth();
  const { execute } = useApi();

  async function handleCreateCard(title: string, description: string) {
    if (!userId) return;
    await execute(() =>
      apiService.createCard(boardId, list.id, { title, description }, userId)
    );
    setShowCreateCardModal(false);
    onRefresh();
  }

  function getDragOverPosition(mouseY: number) {
    if (!cardsContainerRef.current) return list.cards.length;

    if (list.cards.length === 0) return 0;

    const cardElements = Array.from(cardsContainerRef.current.querySelectorAll('[data-card]')) as HTMLElement[];
    for (let i = 0; i < cardElements.length; i++) {
      const rect = cardElements[i].getBoundingClientRect();
      const middleY = rect.top + rect.height / 2;
      if (mouseY < middleY) return i;
    }

    return list.cards.length;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    setDragOverPosition(getDragOverPosition(e.clientY));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    onCardDrop(list.id, dragOverPosition ?? list.cards.length);
    setDragOverPosition(null);
    setIsDragOver(false);
  }

  function handleDragLeave(e: React.DragEvent) {
    const rect = e.currentTarget.getBoundingClientRect();
    const margin = list.cards.length === 0 ? 50 : 0;
    if (
      e.clientX < rect.left - margin ||
      e.clientX > rect.right + margin ||
      e.clientY < rect.top - margin ||
      e.clientY > rect.bottom + margin
    ) {
      setDragOverPosition(null);
      setIsDragOver(false);
    }
  }

  const dragOverClass = isDragOver
    ? 'border-blue-400 bg-slate-750 shadow-blue-500/20'
    : 'border-slate-700';

  return (
    <div className="flex-shrink-0 w-72">
      <div className={`bg-slate-800 rounded-lg p-4 border shadow-lg transition-all duration-200 ${dragOverClass}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-100 truncate">{list.name}</h2>
          <span className="text-sm text-gray-300 bg-slate-700 px-2 py-1 rounded-full">{list.cards?.length || 0}</span>
        </div>

        <div
          ref={cardsContainerRef}
          className={`space-y-3 min-h-2 transition-all duration-200 ${
            list.cards.length === 0 && isDragOver
              ? 'min-h-20 bg-blue-900/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center'
              : ''
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
          onDragEnter={e => e.preventDefault()}
        >
          {list.cards.length === 0 && isDragOver && (
            <div className="text-blue-300 text-sm font-medium flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Drop card here</span>
            </div>
          )}

          {dragOverPosition === 0 && list.cards.length > 0 && (
            <div className="h-2 bg-blue-400 rounded opacity-90 shadow-lg animate-pulse" />
          )}

          {list.cards?.map((card, index) => (
            <React.Fragment key={card.id}>
              <Card
                card={card}
                boardId={boardId}
                onDragStart={() => onCardDragStart(card.id, list.id)}
                onRefresh={onRefresh}
              />
              {dragOverPosition === index + 1 && (
                <div className="h-2 bg-blue-400 rounded opacity-90 shadow-lg animate-pulse" />
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => setShowCreateCardModal(true)}
          className="w-full mt-3 p-2 text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center space-x-2 border border-slate-600 hover:border-slate-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add a card</span>
        </button>
      </div>

      {showCreateCardModal && (
        <CreateCardModal
          onClose={() => setShowCreateCardModal(false)}
          onCreate={handleCreateCard}
        />
      )}
    </div>
  );
}

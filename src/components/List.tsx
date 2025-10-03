import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Trash } from 'lucide-react';
import { List as ListType } from '../types';
import { Card } from './Card';
import { CreateCardModal } from './CreateCardModal';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(list.name);

  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { userId } = useAuth();
  const { execute } = useApi();

  useEffect(() => {
    setNameInput(list.name);
  }, [list.name]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        (menuRef.current && menuRef.current.contains(target)) ||
        (buttonRef.current && buttonRef.current.contains(target))
      ) {
        return;
      }

      setShowMenu(false);
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  async function handleCreateCard(title: string, description: string) {
    if (!userId) return;
    await execute(() =>
      apiService.createCard(boardId, list.id, { title, description }, userId)
    );
    setShowCreateCardModal(false);
    onRefresh();
  }

  async function handleDeleteList() {
    if (!userId) return;
    await execute(() => apiService.deleteList(boardId, list.id, userId));
    setShowDeleteConfirm(false);
    onRefresh();
  }

  async function handleUpdateListName() {
    if (!userId || nameInput.trim() === '' || nameInput === list.name) {
      setIsEditingName(false);
      setNameInput(list.name);
      return;
    }

    await execute(() =>
      apiService.updateListName(boardId, list.id, { name: nameInput }, userId)
    );

    setIsEditingName(false);
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
    <div className="flex-shrink-0 w-72 relative">
      <div className={`bg-slate-800 rounded-lg p-4 border shadow-lg transition-all duration-200 ${dragOverClass}`}>
        <div className="flex items-center justify-between mb-4">
          {isEditingName ? (
            <input
              autoFocus
              className="font-semibold text-gray-100 truncate bg-slate-700 rounded px-2 py-1 w-full"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleUpdateListName}
              onKeyDown={e => {
                if (e.key === 'Enter') handleUpdateListName();
                if (e.key === 'Escape') {
                  setIsEditingName(false);
                  setNameInput(list.name);
                }
              }}
            />
          ) : (
            <h2
              className="font-semibold text-gray-100 truncate cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {list.name}
            </h2>
          )}

          <div className="flex items-center space-x-2 relative">
            <span className="text-sm text-gray-300 bg-slate-700 px-2 py-1 rounded-full">
              {list.cards?.length || 0}
            </span>

            {/* Botão menu */}
            <button
              ref={buttonRef}
              onClick={() => setShowMenu(prev => !prev)}
              className="p-1 rounded hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-300" />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute top-8 left-8 w-40 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 origin-top-right"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-600/20 rounded-t-lg justify-start"
                >
                  <Trash className="w-4 h-4" />
                  <span>Delete list</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div
          ref={cardsContainerRef}
          className={`space-y-3 min-h-2 transition-all duration-200 ${list.cards.length === 0 && isDragOver
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-96 shadow-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Delete list</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the list <strong>{list.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded bg-slate-600 hover:bg-slate-500 text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteList}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

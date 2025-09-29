import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Board } from '../types';
import { apiService } from '../services/api';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { useSignalR } from '../hooks/useSignalR';
import { List } from '../components/List';
import { CreateListModal } from '../components/CreateListModal';
import { Header } from '../components/Header';
import { BoardHeader } from '../components/BoardHeader';

export function BoardView(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; sourceListId: string } | null>(null);

  const { userId } = useAuth();
  const { execute } = useApi();
  const { leaveBoard, isConnected } = useSignalR(id);

  useEffect(() => {
    window.addEventListener('signalr-card-moved', handleCardMoved as EventListener);
    return () => {
      window.removeEventListener('signalr-card-moved', handleCardMoved as EventListener);
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    loadBoard();
  }, [id, userId, navigate]);

  async function loadBoard() {
    if (!userId || !id) return;

    const result = await execute(() => apiService.getBoard(id, userId));
    if (result) {
      setBoard(result);
    } else {
      navigate('/');
    }
  }

  function moveCardInState(prevBoard: Board | null, cardId: string, targetListId: string, targetPosition: number): Board | null {
    if (!prevBoard) return prevBoard;

    const newBoard = { ...prevBoard };
    newBoard.lists = prevBoard.lists?.map(list => ({
      ...list,
      cards: [...(list.cards || [])]
    })) || [];

    let cardToMove = null;
    let sourceListIndex = -1;
    let cardIndex = -1;

    for (let i = 0; i < newBoard.lists.length; i++) {
      const list = newBoard.lists[i];
      const idx = list.cards?.findIndex(c => c.id === cardId) ?? -1;
      if (idx !== -1) {
        cardToMove = list.cards?.[idx];
        sourceListIndex = i;
        cardIndex = idx;
        break;
      }
    }

    if (!cardToMove) return prevBoard;

    newBoard.lists[sourceListIndex].cards?.splice(cardIndex, 1);

    const targetListIndex = newBoard.lists.findIndex(list => list.id === targetListId);
    if (targetListIndex !== -1) {
      if (!newBoard.lists[targetListIndex].cards) {
        newBoard.lists[targetListIndex].cards = [];
      }
      if (targetPosition === -1 || targetPosition >= newBoard.lists[targetListIndex].cards!.length) {
        newBoard.lists[targetListIndex].cards!.push(cardToMove);
      } else {
        newBoard.lists[targetListIndex].cards!.splice(targetPosition, 0, cardToMove);
      }
    }

    return newBoard;
  }

  function handleCardMoved(event: CustomEvent) {
    const { cardId, listId, position, userId: eventUserId } = event.detail;

    if (eventUserId === userId) return;

    setBoard(prevBoard => {
      if (!prevBoard) return prevBoard;

      const newBoard = moveCardInState(prevBoard, cardId, listId, position);
      newBoard!.lastUpdate = new Date().toISOString();
      return newBoard;
    });
  }

  async function handleCreateList(name: string) {
    if (!userId || !board) return;

    await execute(() => apiService.createList(board.id, { name }, userId));
    setShowCreateListModal(false);
    loadBoard();
  }

  function handleCardDragStart(cardId: string, listId: string) {
    setDraggedCard({ cardId, sourceListId: listId });
  }

  async function handleCardDrop(targetListId: string, targetPosition: number) {
    if (!draggedCard || !userId || !board) return;

    const sourceList = board.lists.find(l => l.id === draggedCard.sourceListId);
    const currentIndex = sourceList?.cards?.findIndex(c => c.id === draggedCard.cardId) ?? -1;

    if (draggedCard.sourceListId !== targetListId || currentIndex !== targetPosition) {
      try {
        await execute(() =>
          apiService.moveCard(board.id, draggedCard.cardId, { targetListId, targetPosition }, userId)
        );

        setBoard(prevBoard =>
          moveCardInState(prevBoard, draggedCard.cardId, targetListId, targetPosition)
        );
      } catch (error) {
        console.error('Failed to move card:', error);
      }
    }

    setDraggedCard(null);
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header showBackButton={true} onBack={() => navigate('/')} />
      <BoardHeader
        board={board}
        onRefresh={loadBoard}
        isConnected={isConnected}
        onLeaveBoard={leaveBoard}
      />

      <div className="p-6 overflow-x-auto">
        <div className="flex space-x-6 min-h-[calc(100vh-180px)]">
          {board.lists?.map(list => (
            <List
              key={list.id}
              list={list}
              boardId={board.id}
              onCardDragStart={handleCardDragStart}
              onCardDrop={handleCardDrop}
              onRefresh={loadBoard}
            />
          ))}

          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCreateListModal(true)}
              className="w-72 p-4 card border-2 border-dashed border-slate-600 text-slate-400 hover:border-slate-500 hover:bg-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add a list</span>
            </button>
          </div>
        </div>
      </div>

      {showCreateListModal && (
        <CreateListModal
          onClose={() => setShowCreateListModal(false)}
          onCreate={handleCreateList}
        />
      )}
    </div>
  );
}

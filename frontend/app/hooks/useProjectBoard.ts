import { useState, useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';

interface UseProjectBoardProps {
  onMoveTask: (taskId: string, targetColumnId: string, newOrder: number) => Promise<void>;
}

export function useProjectBoard({ onMoveTask }: UseProjectBoardProps) {
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = draggableId.replace('task-', '');
    const targetColumnId = destination.droppableId.replace('column-', '');

    try {
      await onMoveTask(taskId, targetColumnId, destination.index);
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }, [onMoveTask]);

  return {
    showColumnModal,
    showParticipantModal,
    setShowColumnModal,
    setShowParticipantModal,
    handleDragEnd,
  };
}

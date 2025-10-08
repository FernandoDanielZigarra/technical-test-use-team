import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { DropResult } from '@hello-pangea/dnd';
import { moveTaskBetweenColumns, reorderTasksLocally } from '~/store/slices/projectSlice';
import type { RootState } from '~/store';

interface UseProjectBoardProps {
  onMoveTask: (taskId: string, targetColumnId: string, newOrder: number) => Promise<void>;
}

export function useProjectBoard({ onMoveTask }: UseProjectBoardProps) {
  const dispatch = useDispatch();
  const columns = useSelector((state: RootState) => state.project.columns);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const taskId = draggableId.replace('task-', '');
    const sourceColumnId = source.droppableId.replace('column-', '');
    const targetColumnId = destination.droppableId.replace('column-', '');

    if (sourceColumnId === targetColumnId) {
      const column = columns.find(c => c.id === sourceColumnId);
      if (column) {
        const newTasks = [...column.tasks];
        const [movedTask] = newTasks.splice(source.index, 1);
        newTasks.splice(destination.index, 0, movedTask);
        
        const reorderedTasks = newTasks.map((task, index) => ({
          ...task,
          order: index,
        }));
        
        dispatch(reorderTasksLocally({
          columnId: sourceColumnId,
          tasks: reorderedTasks,
        }));
      }
    } else {
      dispatch(moveTaskBetweenColumns({
        taskId,
        sourceColumnId,
        targetColumnId,
        newOrder: destination.index,
      }));
    }

    try {
      await onMoveTask(taskId, targetColumnId, destination.index);
    } catch (error) {
      console.error('Error moving task:', error);
      throw error;
    }
  }, [onMoveTask, dispatch, columns]);

  return {
    showColumnModal,
    showParticipantModal,
    setShowColumnModal,
    setShowParticipantModal,
    handleDragEnd,
  };
}

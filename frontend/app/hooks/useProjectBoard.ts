import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { DropResult } from '@hello-pangea/dnd';
import { moveTaskBetweenColumns, reorderTasksLocally } from '~/store/slices/projectSlice';
import type { RootState } from '~/store';

interface UseProjectBoardProps {
  onMoveTask: (taskId: string, targetColumnId: string, newOrder: number) => Promise<void>;
}

/**
 * useProjectBoard - Hook personalizado para gestionar la lógica del tablero Kanban
 *
 * Responsabilidades:
 * 1. Gestionar el estado de modales (columnas y participantes)
 * 2. Manejar el drag & drop de tareas con optimistic updates
 * 3. Sincronizar cambios locales con el backend
 *
 * Flujo de drag & drop:
 * 1. Usuario arrastra una tarea
 * 2. Actualización optimista del estado local (Redux)
 * 3. Request al backend para persistir el cambio
 * 4. Si falla: El estado local se revierte automáticamente
 *
 * @param onMoveTask - Callback para persistir el movimiento en el backend (mutation de RTK Query)
 * @returns Handlers y estado para el componente ProjectBoard
 */
export function useProjectBoard({ onMoveTask }: UseProjectBoardProps) {
  const dispatch = useDispatch();
  const columns = useSelector((state: RootState) => state.project.columns);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  /**
   * handleDragEnd - Callback principal del drag & drop (react-beautiful-dnd)
   *
   * Este handler es el corazón del sistema de drag & drop. Maneja dos escenarios:
   *
   * Escenario 1: Reordenamiento dentro de la misma columna
   * - Solo cambia el orden de las tareas
   * - Dispatch de acción reorderTasksLocally (actualización optimista)
   * - Recalcula el campo 'order' de todas las tareas afectadas
   *
   * Escenario 2: Movimiento entre columnas diferentes
   * - Cambia la columna Y el orden de la tarea
   * - Dispatch de acción moveTaskBetweenColumns (actualización optimista)
   * - Actualiza las listas de ambas columnas (origen y destino)
   *
   * ¿Qué es una actualización optimista?
   * - El UI se actualiza inmediatamente (antes de la confirmación del servidor)
   * - Da sensación de rapidez al usuario
   * - Si el backend falla: RTK Query revierte el cambio automáticamente
   * - Esto se logra usando el tag invalidation de RTK Query
   *
   * Parsing de IDs:
   * - draggableId viene como "task-{id}" → extraemos el id real
   * - droppableId viene como "column-{id}" → extraemos el id real
   * - Esto es necesario por cómo react-beautiful-dnd identifica elementos
   *
   * @param result - Objeto con información del drag (source, destination, draggableId)
   */
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Validación 1: ¿Hay destino válido? (puede ser null si se suelta fuera)
    if (!destination) return;

    // Validación 2: ¿Cambió algo realmente?
    // (mismo índice en la misma columna = no hacer nada)
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Parseo de IDs: Quitar prefijos "task-" y "column-"
    const taskId = draggableId.replace('task-', '');
    const sourceColumnId = source.droppableId.replace('column-', '');
    const targetColumnId = destination.droppableId.replace('column-', '');

    // CASO 1: Reordenamiento dentro de la misma columna
    if (sourceColumnId === targetColumnId) {
      const column = columns.find(c => c.id === sourceColumnId);
      if (column) {
        // Algoritmo de reordenamiento:
        // 1. Copiar array de tareas
        const newTasks = [...column.tasks];

        // 2. Extraer la tarea movida de su posición original
        const [movedTask] = newTasks.splice(source.index, 1);

        // 3. Insertarla en la nueva posición
        newTasks.splice(destination.index, 0, movedTask);

        // 4. Recalcular el campo 'order' de todas las tareas
        //    (order debe ser secuencial: 0, 1, 2, 3...)
        const reorderedTasks = newTasks.map((task, index) => ({
          ...task,
          order: index,
        }));

        // 5. Dispatch de actualización optimista al store de Redux
        dispatch(reorderTasksLocally({
          columnId: sourceColumnId,
          tasks: reorderedTasks,
        }));
      }
    } else {
      // CASO 2: Movimiento entre columnas diferentes
      // Dispatch de actualización optimista: Mueve la tarea de una columna a otra
      dispatch(moveTaskBetweenColumns({
        taskId,
        sourceColumnId,
        targetColumnId,
        newOrder: destination.index,
      }));
    }

    // Persistir el cambio en el backend
    // RTK Query se encarga de revertir si falla (invalidation tags)
    try {
      await onMoveTask(taskId, targetColumnId, destination.index);
    } catch (error) {
      console.error('Error moving task:', error);
      // El error se propaga para que RTK Query maneje el rollback
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

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import type { Column as ColumnType, User } from '~/interfaces/projects';

import { useDeleteColumnMutation } from '~/api/projectsApi';
import { ConfirmModal } from '~/components/common';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';

interface ColumnProps {
  column: ColumnType;
  participants: User[];
}

export function Column({ column, participants }: Readonly<ColumnProps>) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteColumn] = useDeleteColumnMutation();

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteColumn(column.id).unwrap();
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  return (
    <>
      <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 w-80 flex-shrink-0 flex flex-col h-full">
        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {column.title}
            <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </h3>
          <button
            onClick={handleDeleteClick}
            className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400"
            title="Eliminar columna"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <Droppable droppableId={`column-${column.id}`} type="TASK">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 overflow-y-auto min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-950/50' : ''
              }`}
            >
              {column.tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        <button
          onClick={() => setShowTaskModal(true)}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          Agregar tarea
        </button>
      </div>

      {showTaskModal && (
        <CreateTaskModal
          columnId={column.id}
          participants={participants}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar columna"
        message={
          column.tasks.length > 0
            ? `Esta columna tiene ${column.tasks.length} tarea(s).\n¿Estás seguro de que deseas eliminarla?\n\nEsta acción no se puede deshacer.`
            : '¿Estás seguro de que deseas eliminar esta columna?\n\nEsta acción no se puede deshacer.'
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}

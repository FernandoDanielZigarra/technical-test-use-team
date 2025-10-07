import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import type { Column as ColumnType, User } from '~/interfaces/projects';

import { useDeleteColumnMutation } from '~/api/projectsApi';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from './CreateTaskModal';

interface ColumnProps {
  column: ColumnType;
  participants: User[];
}

export function Column({ column, participants }: Readonly<ColumnProps>) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [deleteColumn] = useDeleteColumnMutation();

  const handleDeleteColumn = async () => {
    if (column.tasks.length > 0) {
      if (
        !window.confirm(
          `Esta columna tiene ${column.tasks.length} tarea(s). ¿Eliminar de todas formas?`,
        )
      ) {
        return;
      }
    }

    try {
      await deleteColumn(column.id).unwrap();
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  return (
    <>
      <div className="bg-gray-50 rounded-lg p-3 w-80 flex-shrink-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {column.title}
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {column.tasks.length}
            </span>
          </h3>
          <button
            onClick={handleDeleteColumn}
            className="text-gray-400 hover:text-red-600"
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
              className={`min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
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
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
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
    </>
  );
}

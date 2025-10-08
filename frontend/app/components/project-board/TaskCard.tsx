import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { User, Trash2 } from 'lucide-react';
import type { Task } from '~/interfaces/projects';
import { useDeleteTaskMutation } from '~/api/projectsApi';
import { Title, Button } from '~/components/common';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: Readonly<TaskCardProps>) {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(task.id).unwrap();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <>
      <Draggable draggableId={`task-${task.id}`} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-2 cursor-grab active:cursor-grabbing ${
              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <Title level={4} size="sm" className="flex-1 font-medium">{task.title}</Title>
              <button
                onClick={handleDeleteClick}
                className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 ml-2"
                title="Eliminar tarea"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {task.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">{task.description}</p>
            )}

            {task.assignee && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <User size={12} />
                <span>{task.assignee.name}</span>
              </div>
            )}
          </div>
        )}
      </Draggable>

      {}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70]">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <Title level={3} size="lg" className="mb-1">
                  ¿Eliminar tarea?
                </Title>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer. La tarea "{task.title}" será eliminada permanentemente.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                variant="secondary"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                isLoading={isLoading}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

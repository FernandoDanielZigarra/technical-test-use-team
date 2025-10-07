import { Draggable } from '@hello-pangea/dnd';
import { User, Trash2 } from 'lucide-react';
import type { Task } from '~/interfaces/projects';
import { useDeleteTaskMutation } from '~/api/projectsApi';

interface TaskCardProps {
  task: Task;
  index: number;
}

export function TaskCard({ task, index }: Readonly<TaskCardProps>) {
  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar esta tarea?')) {
      try {
        await deleteTask(task.id).unwrap();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm text-gray-900 flex-1">{task.title}</h4>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 ml-2"
              title="Eliminar tarea"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}

          {task.assignee && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <User size={12} />
              <span>{task.assignee.name}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}

import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useSelector } from 'react-redux';
import { Plus, Users } from 'lucide-react';
import type { RootState } from '~/store';
import { useMoveTaskMutation } from '~/api/projectsApi';
import { useProjectBoard } from '~/hooks/useProjectBoard';
import { Column } from './Column';
import { CreateColumnModal } from './CreateColumnModal';
import { AddParticipantModal } from './AddParticipantModal';

interface ProjectBoardProps {
  projectId: string;
}

export function ProjectBoard({ projectId }: Readonly<ProjectBoardProps>) {
  const { columns, currentProject } = useSelector((state: RootState) => state.project);
  const [moveTask] = useMoveTaskMutation();

  const {
    showColumnModal,
    showParticipantModal,
    setShowColumnModal,
    setShowParticipantModal,
    handleDragEnd,
  } = useProjectBoard({
    onMoveTask: async (taskId, targetColumnId, newOrder) => {
      await moveTask({
        id: taskId,
        data: { targetColumnId, newOrder },
      }).unwrap();
    },
  });

  const allParticipants = currentProject?.participants.map((p) => p.user) || [];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentProject?.name}</h1>
          {currentProject?.description && (
            <p className="text-sm text-gray-600 mt-1">{currentProject.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowParticipantModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Users size={18} />
            Participantes ({currentProject?.participants.length || 0})
          </button>
          <button
            onClick={() => setShowColumnModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus size={18} />
            Nueva Columna
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-4 p-6 h-full"
              >
                {columns.map((column) => (
                  <Column key={column.id} column={column} participants={allParticipants} />
                ))}
                {provided.placeholder}

                {columns.length === 0 && (
                  <div className="flex items-center justify-center w-full h-64 text-gray-400">
                    <div className="text-center">
                      <p className="text-lg mb-2">No hay columnas todavía</p>
                      <p className="text-sm">Crea tu primera columna para comenzar</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {showColumnModal && (
        <CreateColumnModal projectId={projectId} onClose={() => setShowColumnModal(false)} />
      )}

      {showParticipantModal && (
        <AddParticipantModal projectId={projectId} onClose={() => setShowParticipantModal(false)} />
      )}
    </div>
  );
}

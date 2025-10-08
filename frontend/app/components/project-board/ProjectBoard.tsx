import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useSelector } from 'react-redux';
import { Plus, Users, FileDown } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import type { RootState } from '~/store';
import { useMoveTaskMutation, useExportBacklogMutation } from '~/api/projectsApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useProjectBoard } from '~/hooks/useProjectBoard';
import { Column } from './Column';
import { CreateColumnModal } from './CreateColumnModal';
import { ManageParticipantsModal } from './ManageParticipantsModal';
import { Button, Input, Title } from '~/components/common';

interface ProjectBoardProps {
  projectId: string;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export function ProjectBoard({ projectId }: Readonly<ProjectBoardProps>) {
  const { columns, currentProject } = useSelector((state: RootState) => state.project);
  const [moveTask] = useMoveTaskMutation();
  const [exportBacklog, { isLoading: isExporting }] = useExportBacklogMutation();
  const [exportEmail, setExportEmail] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleExport = async () => {
    try {
      const result = await exportBacklog({
        projectId,
        email: exportEmail || currentProject?.owner.email || '',
      }).unwrap();

      toast.success(
        `${result.message}\n📧 Email enviado a: ${result.email}\n📊 Total de tareas: ${result.tasksCount}`,
        { duration: 5000 }
      );
      setShowExportModal(false);
      setExportEmail('');
  } catch (error: unknown) {
      console.error('Error al exportar:', error);

      const defaultMessage =
        'Error al exportar el backlog. Verifica que N8N esté activo y configurado.';
      let detailedMessage = defaultMessage;

      if (isFetchBaseQueryError(error)) {
        const data = error.data;
        if (typeof data === 'string' && data.trim().length > 0) {
          detailedMessage = data;
        } else if (data && typeof data === 'object') {
          const maybeObject = data as {
            message?: unknown;
            attempts?: unknown;
            hint?: unknown;
          };

          const pieces: string[] = [];
          if (typeof maybeObject.message === 'string') {
            pieces.push(maybeObject.message);
          }

          if (Array.isArray(maybeObject.attempts) && maybeObject.attempts.length > 0) {
            pieces.push('Detalles de los intentos:');
            pieces.push(
              maybeObject.attempts
                .map((attempt) => `• ${attempt}`)
                .join('\n'),
            );
          }

          if (typeof maybeObject.hint === 'string') {
            pieces.push(`💡 ${maybeObject.hint}`);
          }

          if (pieces.length > 0) {
            detailedMessage = pieces.join('\n');
          }
        }
      } else if (error instanceof Error && error.message) {
        detailedMessage = error.message;
      }

      toast.error(detailedMessage, { duration: 6000 });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <Title level={1} size="xl">{currentProject?.name}</Title>
          {currentProject?.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{currentProject.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowExportModal(true)}
            variant="success"
            className="flex items-center gap-2"
            title="Exportar backlog a CSV por email"
          >
            <FileDown size={18} />
            Exportar Backlog
          </Button>
          <Button
            onClick={() => setShowParticipantModal(true)}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Users size={18} />
            Participantes ({currentProject?.participants.length || 0})
          </Button>
          <Button
            onClick={() => setShowColumnModal(true)}
            variant="primary"
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva Columna
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
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
                  <div className="flex items-center justify-center w-full h-64 text-slate-400 dark:text-slate-500">
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
        <ManageParticipantsModal projectId={projectId} onClose={() => setShowParticipantModal(false)} />
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <Title level={2} size="xl" className="mb-4">
              📤 Exportar Backlog
            </Title>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Se generará un archivo CSV con todas las tareas del proyecto y se enviará por email.
            </p>
            <div className="mb-4">
              <Input
                label="Email destino"
                type="email"
                value={exportEmail}
                onChange={(e) => setExportEmail(e.target.value)}
                placeholder={currentProject?.owner.email || 'email@ejemplo.com'}
                helperText="Deja vacío para usar el email del propietario del proyecto"
                fullWidth
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                isLoading={isExporting}
                variant="success"
                fullWidth
              >
                Exportar
              </Button>
              <Button
                onClick={() => {
                  setShowExportModal(false);
                  setExportEmail('');
                }}
                disabled={isExporting}
                variant="secondary"
                fullWidth
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

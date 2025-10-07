import { useState } from 'react';
import { useCreateTaskMutation } from '~/api/projectsApi';
import type { User } from '~/interfaces/projects';
import { Modal, Button } from '~/components/common';

interface CreateTaskModalProps {
  readonly columnId: string;
  readonly participants: User[];
  readonly onClose: () => void;
}

export function CreateTaskModal({ columnId, participants, onClose }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<number | ''>('');
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask({
        columnId,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          assigneeId: assigneeId !== '' ? Number(assigneeId) : undefined,
        },
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error al crear tarea');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nueva Tarea">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="task-assignee" className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a
            </label>
            <select
              id="task-assignee"
              value={assigneeId}
              onChange={(e) =>
                setAssigneeId(e.target.value === '' ? '' : Number(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sin asignar</option>
              {participants.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" disabled={!title.trim()} isLoading={isLoading}>
            Crear Tarea
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

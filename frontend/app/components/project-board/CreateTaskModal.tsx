import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateTaskMutation } from '~/api/projectsApi';
import type { User } from '~/interfaces/projects';
import { Modal, Button, Input, Textarea, Select } from '~/components/common';

interface CreateTaskModalProps {
  readonly columnId: string;
  readonly participants: User[];
  readonly onClose: () => void;
}

export function CreateTaskModal({ columnId, participants, onClose }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>('');
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
          assigneeId: assigneeId !== '' ? assigneeId : null,
        },
      }).unwrap();
      toast.success('Tarea creada exitosamente');
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error al crear tarea');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nueva Tarea">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <Input
              label="Título"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              autoFocus
              required
              fullWidth
            />
          </div>

          <div className="mb-4">
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción opcional"
              rows={3}
              fullWidth
            />
          </div>

          <div className="mb-4">
            <Select
              label="Asignar a"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              fullWidth
            >
              <option value="">Sin asignar</option>
              {participants.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </Select>
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

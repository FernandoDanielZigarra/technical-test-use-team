import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateColumnMutation } from '~/api/projectsApi';
import { Modal, Button, Input } from '~/components/common';

interface CreateColumnModalProps {
  readonly projectId: string;
  readonly onClose: () => void;
}

export function CreateColumnModal({ projectId, onClose }: CreateColumnModalProps) {
  const [title, setTitle] = useState('');
  const [createColumn, { isLoading }] = useCreateColumnMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createColumn({ title: title.trim(), projectId }).unwrap();
      toast.success('Columna creada exitosamente');
      onClose();
    } catch (error) {
      console.error('Error creating column:', error);
      toast.error('Error al crear columna');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nueva Columna">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <Input
            label="Nombre de la columna"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Por hacer, En progreso, Completado"
            autoFocus
            required
            fullWidth
          />
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" disabled={!title.trim()} isLoading={isLoading}>
            Crear Columna
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

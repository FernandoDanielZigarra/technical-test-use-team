import { useState } from 'react';
import { useCreateColumnMutation } from '~/api/projectsApi';
import { Modal, Button } from '~/components/common';

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
      onClose();
    } catch (error) {
      console.error('Error creating column:', error);
      alert('Error al crear columna');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nueva Columna">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <label htmlFor="column-title" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la columna
            </label>
            <input
              id="column-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Por hacer, En progreso, Completado"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </div>
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

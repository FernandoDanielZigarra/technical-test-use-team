import { useState } from 'react';
import { useAddParticipantMutation } from '~/api/projectsApi';
import { ParticipantRole } from '~/interfaces/projects';
import { Modal, Button } from '~/components/common';

interface AddParticipantModalProps {
  readonly projectId: string;
  readonly onClose: () => void;
}

export function AddParticipantModal({ projectId, onClose }: AddParticipantModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ParticipantRole>(ParticipantRole.MEMBER);
  const [addParticipant, { isLoading }] = useAddParticipantMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await addParticipant({
        projectId,
        data: { email: email.trim(), role },
      }).unwrap();
      onClose();
    } catch (error: any) {
      console.error('Error adding participant:', error);
      if (error?.data?.message) {
        alert(error.data.message);
      } else {
        alert('Error al agregar participante. Verifica que el email exista.');
      }
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Agregar Participante">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <label htmlFor="participant-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email del usuario *
            </label>
            <input
              id="participant-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="participant-role" className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              id="participant-role"
              value={role}
              onChange={(e) => setRole(e.target.value as ParticipantRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={ParticipantRole.MEMBER}>Miembro</option>
              <option value={ParticipantRole.OWNER}>Propietario</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Los propietarios pueden editar el proyecto y agregar/remover participantes
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" disabled={!email.trim()} isLoading={isLoading}>
            Agregar
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

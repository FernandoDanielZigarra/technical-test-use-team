import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAddParticipantMutation } from '~/api/projectsApi';
import { ParticipantRole } from '~/interfaces/projects';
import { Modal, Button, Input, Select } from '~/components/common';

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
      toast.success('Participante agregado exitosamente');
      onClose();
    } catch (error: any) {
      console.error('Error adding participant:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Error al agregar participante. Verifica que el email exista.');
      }
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Agregar Participante">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <Input
              label="Email del usuario"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@example.com"
              autoFocus
              required
              fullWidth
            />
          </div>

          <div className="mb-4">
            <Select
              label="Rol"
              value={role}
              onChange={(e) => setRole(e.target.value as ParticipantRole)}
              helperText="Los propietarios pueden editar el proyecto y agregar/remover participantes"
              fullWidth
            >
              <option value={ParticipantRole.MEMBER}>Miembro</option>
              <option value={ParticipantRole.OWNER}>Propietario</option>
            </Select>
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

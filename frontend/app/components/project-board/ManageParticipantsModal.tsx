import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { UserMinus, Crown, User as UserIcon, LogOut, UserCog } from 'lucide-react';
import { 
  useAddParticipantMutation, 
  useRemoveParticipantMutation, 
  useLeaveProjectMutation,
  useUpdateParticipantRoleMutation 
} from '~/api/projectsApi';
import { ParticipantRole } from '~/interfaces/projects';
import type { RootState } from '~/store';
import { Modal, Button, Input, Select, Title } from '~/components/common';
import { getCurrentUserId } from '~/middleware/auth';

interface ManageParticipantsModalProps {
  readonly projectId: string;
  readonly onClose: () => void;
}

export function ManageParticipantsModal({ projectId, onClose }: ManageParticipantsModalProps) {
  const navigate = useNavigate();
  const currentProject = useSelector((state: RootState) => state.project.currentProject);
  const currentUserId = getCurrentUserId();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ParticipantRole>(ParticipantRole.MEMBER);
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [participantToChangeRole, setParticipantToChangeRole] = useState<{ id: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState<ParticipantRole>(ParticipantRole.MEMBER);
  
  const [addParticipant, { isLoading: isAdding }] = useAddParticipantMutation();
  const [removeParticipant, { isLoading: isRemoving }] = useRemoveParticipantMutation();
  const [leaveProject, { isLoading: isLeaving }] = useLeaveProjectMutation();
  const [updateParticipantRole, { isLoading: isUpdatingRole }] = useUpdateParticipantRoleMutation();

  const isProjectOwner = currentProject?.ownerId === currentUserId;
  const participants = currentProject?.participants ?? [];
  const primaryOwnerId = currentProject?.ownerId ?? null;
  const currentUserParticipant = participants.find((p) => p.userId === currentUserId);
  const isParticipantOwner = currentUserParticipant?.role === ParticipantRole.OWNER;
  const canManageParticipants = isProjectOwner || isParticipantOwner;

  const additionalOwnerParticipants = participants.filter(
    (participant) => participant.role === ParticipantRole.OWNER && participant.userId !== primaryOwnerId
  );
  const participantsWithoutPrimaryOwner = participants.filter(
    (participant) => participant.userId !== primaryOwnerId
  );
  const isOnlyMember = isProjectOwner && participantsWithoutPrimaryOwner.length === 0;
  const hasOwnerParticipants = additionalOwnerParticipants.length > 0;
  const onlyHasMembers =
    isProjectOwner && !hasOwnerParticipants && participantsWithoutPrimaryOwner.length > 0;
  const ownerName = currentProject?.owner?.name ?? 'Propietario';
  const ownerEmail = currentProject?.owner?.email ?? '';
  const ownerInitial = ownerName.charAt(0).toUpperCase() || 'P';

  let leaveMessage = 'Perderás acceso al proyecto y todas tus asignaciones de tareas.';
  if (isOnlyMember) {
    leaveMessage = 'Eres el único miembro del proyecto. Si sales, el proyecto será eliminado permanentemente.';
  } else if (onlyHasMembers) {
    leaveMessage = 'Eres el único propietario y solo hay miembros. Si sales, el proyecto será eliminado permanentemente.';
  } else if (hasOwnerParticipants) {
    leaveMessage = 'Hay otros propietarios que pueden gestionar el proyecto. Puedes seleccionar uno o se asignará automáticamente.';
  }

  console.log('ManageParticipantsModal - Debug:', {
    currentUserId,
    projectOwnerId: primaryOwnerId,
    isProjectOwner,
    currentUserParticipant,
    isParticipantOwner,
    canManageParticipants,
    participantsCount: participants.length,
    participantsWithoutPrimaryOwnerCount: participantsWithoutPrimaryOwner.length,
    additionalOwnerParticipantsCount: additionalOwnerParticipants.length,
  });

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await addParticipant({
        projectId,
        data: { email: email.trim(), role },
      }).unwrap();
      toast.success('Participante agregado exitosamente');
      setEmail('');
      setRole(ParticipantRole.MEMBER);
    } catch (error: any) {
      console.error('Error adding participant:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Error al agregar participante. Verifica que el email exista.');
      }
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipant({ projectId, participantId }).unwrap();
      toast.success('Participante eliminado exitosamente');
      setParticipantToDelete(null);
    } catch (error: any) {
      console.error('Error removing participant:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Error al eliminar participante');
      }
    }
  };

  const handleLeaveProject = async () => {
    try {
      
      if (isProjectOwner) {

        await leaveProject({ 
          projectId, 
          newOwnerId: newOwnerId || undefined 
        }).unwrap();
        
        if (isOnlyMember || onlyHasMembers) {
          toast.success('Proyecto eliminado exitosamente');
        } else {
          toast.success('Has salido del proyecto');
        }
      } else {
        
        await leaveProject({ 
          projectId, 
          newOwnerId: undefined 
        }).unwrap();
        
        toast.success('Has salido del proyecto');
      }
      
      setShowLeaveModal(false);
      onClose();
      navigate('/projects');
    } catch (error: any) {
      console.error('Error leaving project:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Error al salir del proyecto');
      }
    }
  };

  const handleChangeRole = async () => {
    if (!participantToChangeRole) return;

    try {
      await updateParticipantRole({
        projectId,
        participantId: participantToChangeRole.id,
        role: newRole,
      }).unwrap();
      
      toast.success('Rol actualizado exitosamente');
      setShowChangeRoleModal(false);
      setParticipantToChangeRole(null);
    } catch (error: any) {
      console.error('Error updating role:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error('Error al cambiar el rol');
      }
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Gestionar Participantes">
      <Modal.Body>
        {}
        <div className="mb-6">
          <Title level={3} size="sm" className="mb-3">
            Participantes actuales
          </Title>
          <div className="space-y-2">
            {}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white font-semibold">
                  {ownerInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {ownerName}
                    </p>
                    <Crown className="w-4 h-4 text-yellow-500" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {ownerEmail}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                Propietario
              </span>
            </div>

            {}
            {participantsWithoutPrimaryOwner.length > 0 ? (
              participantsWithoutPrimaryOwner.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 dark:from-slate-600 dark:to-slate-700 rounded-full text-white font-semibold">
                      {participant.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {participant.user.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {participant.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                      {participant.role === ParticipantRole.OWNER ? 'Propietario' : 'Miembro'}
                    </span>
                    {canManageParticipants && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setParticipantToChangeRole({ id: participant.userId, currentRole: participant.role });
                            setNewRole(participant.role === ParticipantRole.OWNER ? ParticipantRole.MEMBER : ParticipantRole.OWNER);
                            setShowChangeRoleModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Cambiar rol"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setParticipantToDelete(participant.userId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar participante"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
                <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No hay participantes adicionales</p>
              </div>
            )}
          </div>
        </div>

        {}
        {canManageParticipants && (
          <>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-4">
              <Title level={3} size="sm" className="mb-3">
                Agregar nuevo participante
              </Title>
            </div>
            <form onSubmit={handleAddParticipant} className="space-y-4">
              <Input
                label="Email del usuario"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@example.com"
                helperText="Ingresa el email de un usuario registrado"
                fullWidth
              />

              <Select
                label="Rol"
                value={role}
                onChange={(e) => setRole(e.target.value as ParticipantRole)}
                helperText="Los propietarios pueden editar el proyecto y gestionar participantes"
                fullWidth
              >
                <option value={ParticipantRole.MEMBER}>Miembro</option>
                <option value={ParticipantRole.OWNER}>Propietario</option>
              </Select>

              <Button
                type="submit"
                disabled={!email.trim()}
                isLoading={isAdding}
                variant="primary"
                fullWidth
              >
                Agregar Participante
              </Button>
            </form>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="flex gap-3 w-full">
          <Button 
            type="button" 
            onClick={() => setShowLeaveModal(true)} 
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white flex items-center gap-2"
            fullWidth
          >
            <LogOut className="w-4 h-4" />
            Salir del proyecto
          </Button>
          <Button type="button" onClick={onClose} variant="secondary" fullWidth>
            Cerrar
          </Button>
        </div>
      </Modal.Footer>

      {}
      {participantToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                <UserMinus className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <Title level={3} size="lg" className="mb-1">
                  ¿Eliminar participante?
                </Title>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer. El participante perderá acceso al proyecto y todas sus asignaciones de tareas.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={() => setParticipantToDelete(null)}
                variant="secondary"
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => handleRemoveParticipant(participantToDelete)}
                isLoading={isRemoving}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                fullWidth
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex-shrink-0">
                <LogOut className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Title level={3} size="lg" className="mb-1">
                  ¿Salir del proyecto?
                </Title>
                <p className="text-sm text-slate-600 dark:text-slate-400">{leaveMessage}</p>
              </div>
            </div>

            {isProjectOwner && hasOwnerParticipants && !isOnlyMember && (
              <div className="mb-4">
                <Select
                  label="Nuevo propietario (opcional)"
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                  helperText="Puedes elegir el nuevo propietario o dejar que se asigne automáticamente"
                  fullWidth
                >
                  <option value="">Asignar automáticamente</option>
                  {additionalOwnerParticipants
                    .filter((p) => p.userId !== currentUserId)
                    .map((p) => (
                      <option key={p.userId} value={p.userId}>
                        {p.user.name} ({p.user.email})
                      </option>
                    ))}
                </Select>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={() => {
                  setShowLeaveModal(false);
                  setNewOwnerId('');
                }}
                variant="secondary"
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleLeaveProject}
                isLoading={isLeaving}
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700 text-white"
                fullWidth
              >
                {isOnlyMember || onlyHasMembers ? 'Salir y eliminar proyecto' : 'Salir del proyecto'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {}
      {showChangeRoleModal && participantToChangeRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                <UserCog className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Title level={3} size="lg" className="mb-1">
                  Cambiar rol
                </Title>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  ¿Estás seguro de cambiar el rol de este participante?
                </p>
              </div>
            </div>

            <div className="mb-4">
              <Select
                label="Nuevo rol"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as ParticipantRole)}
                helperText="Los propietarios pueden gestionar el proyecto y sus participantes"
                fullWidth
              >
                <option value={ParticipantRole.MEMBER}>Miembro</option>
                <option value={ParticipantRole.OWNER}>Propietario</option>
              </Select>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                onClick={() => {
                  setShowChangeRoleModal(false);
                  setParticipantToChangeRole(null);
                }}
                variant="secondary"
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleChangeRole}
                isLoading={isUpdatingRole}
                variant="primary"
                fullWidth
              >
                Cambiar rol
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

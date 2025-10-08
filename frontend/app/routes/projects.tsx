import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { useGetProjectsQuery, useCreateProjectMutation, useDeleteProjectMutation } from '~/api/projectsApi';
import { requireAuth, getCurrentUserId } from '~/middleware/auth';
import { useAuth } from '~/hooks/useAuth';
import { Button, Input, Textarea, Title, Loading } from '~/components/common';
import toast from 'react-hot-toast';
import { CardProject } from '~/components/project-board';

export async function loader({ request }: LoaderFunctionArgs) {
  return requireAuth({ request });
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: projects = [], isLoading } = useGetProjectsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleCreateProject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const newProject = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      }).unwrap();

      setShowCreateModal(false);
      setName('');
      setDescription('');
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId).unwrap();
      toast.success('Proyecto eliminado exitosamente');
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto');
    }
  };

  if (isLoading) {
    return <Loading message="Cargando proyectos..." fullScreen />;
  }

  const currentUserId = getCurrentUserId();

  const ownedProjects = projects.filter((project) => project.ownerId === currentUserId);
  const memberProjects = projects.filter((project) => project.ownerId !== currentUserId);

  return (
    <div className="h-screen bg-slate-200 dark:bg-slate-950 transition-colors pt-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <Title level={1}>Mis Proyectos</Title>
            <p className="text-slate-600 dark:text-slate-400 mt-2 max-w-2xl">
              Gestiona tus equipos y acompaña el progreso de cada iniciativa en un único lugar.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Nuevo proyecto
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-12">
            {}
            {ownedProjects.length > 0 && (
              <div>
                <Title level={2} className="mb-6">
                  Proyectos donde eres propietario
                </Title>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ownedProjects.map((project) => (
                    <CardProject
                      key={project.id}
                      project={project}
                      isOwner={true}
                      onNavigate={(id) => navigate(`/project/${id}`)}
                      onDelete={(id) => setProjectToDelete(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {}
            {memberProjects.length > 0 && (
              <div>
                <Title level={2} className="mb-6">
                  Proyectos donde eres miembro
                </Title>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {memberProjects.map((project) => (
                    <CardProject
                      key={project.id}
                      project={project}
                      isOwner={false}
                      onNavigate={(id) => navigate(`/project/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <p className="text-lg font-medium">Todavía no tienes proyectos.</p>
            <p className="mt-2 text-sm">Crea el primero para empezar a colaborar con tu equipo.</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="primary"
              className="mt-6 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Crear proyecto
            </Button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition dark:bg-slate-950/70">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5">
              <Title level={2} size="xl">Nuevo proyecto</Title>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Define un nombre y una descripción opcional para comenzar.
              </p>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              <Input
                label="Nombre del proyecto"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Mi proyecto increíble"
                autoFocus
                required
                fullWidth
              />

              <Textarea
                label="Descripción"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe brevemente la idea o el objetivo"
                rows={3}
                fullWidth
              />

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setName('');
                    setDescription('');
                  }}
                  variant="secondary"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || !name.trim()}
                  isLoading={isCreating}
                  variant="primary"
                >
                  Crear proyecto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <Title level={3} size="lg" className="mb-1">
                  ¿Eliminar proyecto?
                </Title>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Esta acción no se puede deshacer. Se eliminarán todas las columnas, tareas y datos asociados.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                onClick={() => setProjectToDelete(null)}
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => handleDeleteProject(projectToDelete)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

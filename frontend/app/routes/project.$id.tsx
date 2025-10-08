import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { useDispatch } from 'react-redux';
import { useGetProjectQuery, projectsApi } from '~/api/projectsApi';
import { setCurrentProject, clearCurrentProject } from '~/store/slices/projectSlice';
import { useSocket } from '~/hooks/useSocket';
import { ProjectBoard } from '~/components/project-board';
import { requireAuth } from '~/middleware/auth';
import { Button, Title } from '~/components/common';
import { UserX } from 'lucide-react';

export async function loader({ request }: LoaderFunctionArgs) {
  return requireAuth({ request });
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const projectId = id || null;
  
  const { data: project, isLoading, error } = useGetProjectQuery(projectId!, {
    skip: !projectId,
  });

  const { removedFromProject, clearRemovedFromProject } = useSocket(projectId);

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [project, dispatch]);

  const handleRemovedConfirm = () => {
    
    dispatch(projectsApi.util.invalidateTags(['Project']));
    clearRemovedFromProject();
    navigate('/projects');
  };

  if (!projectId) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-2">ID de proyecto inválido</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">ID recibido: {id || 'undefined'}</p>
          <Button
            onClick={() => navigate('/projects')}
            variant="primary"
          >
            Volver a proyectos
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error al cargar el proyecto</p>
          <Button
            onClick={() => navigate('/projects')}
            variant="primary"
          >
            Volver a proyectos
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <div className="h-screen bg-slate-200 dark:bg-slate-950 flex flex-col">
        <div className="pt-16 flex-1 overflow-hidden">
          <ProjectBoard projectId={projectId} />
        </div>
      </div>

      {}
      {removedFromProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex-shrink-0">
                <UserX className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Title level={3} size="lg" className="mb-2">
                  Fuiste eliminado del proyecto
                </Title>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Has sido eliminado del proyecto <strong>"{removedFromProject.projectName}"</strong>. Ya no tienes acceso a este proyecto.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleRemovedConfirm}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

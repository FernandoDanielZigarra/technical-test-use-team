import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import type { LoaderFunctionArgs } from 'react-router';
import { useDispatch } from 'react-redux';
import { useGetProjectQuery } from '~/api/projectsApi';
import { setCurrentProject, clearCurrentProject } from '~/store/slices/projectSlice';
import { useSocket } from '~/hooks/useSocket';
import { ProjectBoard } from '~/components/project-board';
import { requireAuth } from '~/middleware/auth';

/**
 * Loader que protege la ruta con autenticación
 * Se ejecuta antes de renderizar el componente
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return requireAuth({ request });
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  console.log('ProjectPage params:', { id });
  
  const projectId = id || null;
  
  console.log('ProjectPage projectId:', projectId);

  const { data: project, isLoading, error } = useGetProjectQuery(projectId!, {
    skip: !projectId,
  });

  // Setup Socket.IO for real-time updates
  useSocket(projectId);

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project));
    }

    return () => {
      dispatch(clearCurrentProject());
    };
  }, [project, dispatch]);

  if (!projectId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">ID de proyecto inválido</p>
          <p className="text-sm text-gray-600 mb-4">ID recibido: {id || 'undefined'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a proyectos
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error al cargar el proyecto</p>
          <button
            onClick={() => navigate('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a proyectos
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-screen">
      <ProjectBoard projectId={projectId} />
    </div>
  );
}

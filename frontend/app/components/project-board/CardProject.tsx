import { Users, Calendar, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import type { Project } from '~/interfaces/projects';
import { Title } from '../common/Title';

interface CardProjectProps {
  readonly project: Project;
  readonly isOwner: boolean;
  readonly onNavigate: (projectId: string) => void;
  readonly onDelete?: (projectId: string) => void;
}

export function CardProject({ project, isOwner, onNavigate, onDelete }: CardProjectProps) {
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(project.id);
    }
  };

  return (
    <div className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-slate-950/40 dark:hover:-translate-y-1 dark:hover:border-slate-700 dark:hover:shadow-slate-900/60">
      <Link 
        to={`/project/${project.id}`}
        className="flex flex-col h-full p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <Title 
              level={2} 
              size="xl" 
              className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition font-semibold"
            >
              {project.name}
            </Title>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <Calendar size={14} />
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            {isOwner && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors relative z-10"
                title="Eliminar proyecto"
                aria-label={`Eliminar proyecto ${project.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {project.description ? (
          <p className="mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
            {project.description}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-slate-400 dark:text-slate-500">
            Sin descripción por ahora.
          </p>
        )}

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Users size={16} />
            {project.participants?.length ?? 0} miembros
          </div>
        </div>
      </Link>
    </div>
  );
}

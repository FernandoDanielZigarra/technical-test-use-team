import { useState, useRef, useEffect } from 'react';
import { User, Mail, Trash2, FolderKanban, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useGetCurrentUserQuery, useDeleteAccountMutation } from '~/api/userApi';
import { Modal, Button, ConfirmModal } from '~/components/common';

export function UserMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/');
  };

  const handleNavigateToProjects = () => {
    setShowDropdown(false);
    navigate('/projects');
  };

  const handleOpenProfile = () => {
    setShowDropdown(false);
    setShowModal(true);
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap();
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const initials = user
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white dark:border-slate-800">
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {}
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-200 border-2 border-white dark:border-slate-800"
          title={user?.name || 'Usuario'}
        >
          {user ? (
            <span className="font-semibold text-sm">{initials}</span>
          ) : (
            <User size={20} />
          )}
        </button>

        {}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-50 overflow-hidden">
            {}
            {user && (
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="py-2">
              <button
                type="button"
                onClick={handleNavigateToProjects}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <FolderKanban className="w-4 h-4" />
                Mis Proyectos
              </button>

              <button
                type="button"
                onClick={handleOpenProfile}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="w-4 h-4" />
                Mi Perfil
              </button>

              <div className="my-1 border-t border-slate-200 dark:border-slate-700" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Mi Perfil"
        size="lg"
      >
        {user ? (
          <>
            <Modal.Body>
              <div className="space-y-6">
                {}
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-3xl shadow-lg">
                    {initials}
                  </div>
                </div>

                {}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <User className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Nombre completo
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Correo electrónico
                      </p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 break-all">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="secondary"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white flex items-center gap-2"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
              </Button>
            </Modal.Footer>
          </>
        ) : (
          <Modal.Body>
            <p className="text-center text-slate-600 dark:text-slate-400">
              No se pudo cargar la información del usuario
            </p>
          </Modal.Body>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        message={`¿Estás seguro de que deseas eliminar tu cuenta?\n\nEsta acción eliminará:\n• Tu perfil de usuario\n• Todos tus proyectos donde seas el único participante\n• Todas las tareas asignadas a ti\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar cuenta"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}

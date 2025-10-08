import { useClickOutside } from '~/hooks/useClickOutside';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: Readonly<ConfirmModalProps>) {
  const modalRef = useClickOutside<HTMLDivElement>(onClose);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700',
    warning: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700',
    info: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700',
  };

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-slate-950/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {title}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

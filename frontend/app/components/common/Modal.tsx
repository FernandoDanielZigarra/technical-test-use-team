import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useClickOutside } from '~/hooks/useClickOutside';

interface ModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly children: ReactNode;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-slate-950/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className={`bg-white dark:bg-slate-900 dark:text-slate-100 border border-slate-200/70 dark:border-slate-800 rounded-xl p-6 w-full ${sizeClasses[size]} shadow-2xl transition-colors duration-300`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ModalBodyProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

interface ModalFooterProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return <div className={`flex justify-end gap-2 ${className}`}>{children}</div>;
}

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} shadow-xl`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
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

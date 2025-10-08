import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { Modal, ModalBody, ModalFooter, Button } from '~/components/common';

export function TokenExpiredModal() {
  const { tokenExpired, acknowledgeTokenExpiration } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClose = useCallback(() => {
    acknowledgeTokenExpiration();
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [acknowledgeTokenExpiration, navigate, location.pathname]);

  return (
    <Modal
      isOpen={tokenExpired}
      onClose={handleClose}
      title="Sesión expirada"
      size="md"
    >
      <ModalBody>
        <p className="text-slate-600 dark:text-slate-300">
          Por seguridad, tu sesión ha caducado. Inicia sesión nuevamente para continuar trabajando en tus proyectos.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={handleClose}>
          Aceptar
        </Button>
      </ModalFooter>
    </Modal>
  );
}

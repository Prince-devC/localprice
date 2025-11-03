import React from 'react';
import Modal, { PrimaryButton, SecondaryButton } from './Modal';

const ConfirmModal = ({
  open,
  title = 'Confirmer',
  message = '',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  busy = false,
  onConfirm,
  onCancel
}) => {
  // Logs de debug pour suivre l'état de la modale
  try {
    console.debug('[ConfirmModal] render', { open, title, message, confirmText, cancelText, busy });
  } catch {}
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <SecondaryButton type="button" onClick={() => { try { console.debug('[ConfirmModal] cancel clicked', { title }); } catch {}; onCancel && onCancel(); }}>{cancelText}</SecondaryButton>
          <PrimaryButton type="button" onClick={() => { try { console.debug('[ConfirmModal] confirm clicked', { title, busy }); } catch {}; onConfirm && onConfirm(); }} disabled={busy} aria-busy={busy}>{confirmText}</PrimaryButton>
        </>
      )}
    >
      <p style={{ color: 'var(--gray-700)' }}>{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
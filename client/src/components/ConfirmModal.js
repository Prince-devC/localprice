import React from 'react';
import Modal, { PrimaryButton, SecondaryButton } from './Modal';

const ConfirmModal = ({
  open,
  title = 'Confirmer',
  message = '',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel
}) => {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <SecondaryButton type="button" onClick={onCancel}>{cancelText}</SecondaryButton>
          <PrimaryButton type="button" onClick={onConfirm}>{confirmText}</PrimaryButton>
        </>
      )}
    >
      <p style={{ color: 'var(--gray-700)' }}>{message}</p>
    </Modal>
  );
};

export default ConfirmModal;
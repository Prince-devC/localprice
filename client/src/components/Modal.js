import React from 'react';
import styled from 'styled-components';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
  border: 1px solid var(--gray-200);
  width: 96%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: var(--gray-800);
`;

const CloseButton = styled.button`
  border: none;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0.25rem;
  border-radius: 6px;
  &:hover { background: var(--gray-100); }
`;

const ModalBody = styled.div`
  padding: 1rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 0.8rem 1rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const PrimaryButton = styled.button`
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #2563eb;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: #2563eb; }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const SecondaryButton = styled.button`
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  background: white;
  color: var(--gray-800);
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: var(--gray-100); }
`;

const Modal = ({ open, title, children, onClose, actions }) => {
  if (!open) return null;
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose && onClose();
    }
  };
  return (
    <Backdrop onClick={handleBackdropClick} aria-modal="true" role="dialog">
      <ModalCard>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Fermer">×</CloseButton>
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        {actions && (
          <ModalFooter>
            {actions}
          </ModalFooter>
        )}
      </ModalCard>
    </Backdrop>
  );
};

export { Modal, PrimaryButton, SecondaryButton };
export default Modal;
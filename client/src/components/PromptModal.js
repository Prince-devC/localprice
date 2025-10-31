import React from 'react';
import Modal, { PrimaryButton, SecondaryButton } from './Modal';

const Input = ({ multiline, value, onChange, placeholder }) => {
  const baseStyle = {
    width: '100%',
    padding: '0.6rem 0.85rem',
    border: '1px solid var(--gray-200)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--gray-800)'
  };
  if (multiline) {
    return (
      <textarea
        style={{ ...baseStyle, minHeight: 90 }}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    );
  }
  return (
    <input
      style={baseStyle}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
};

const PromptModal = ({
  open,
  title = 'Saisie',
  label = 'Valeur',
  placeholder = '',
  defaultValue = '',
  multiline = false,
  required = false,
  submitText = 'Valider',
  cancelText = 'Annuler',
  onSubmit,
  onCancel
}) => {
  const [value, setValue] = React.useState(defaultValue || '');
  React.useEffect(() => {
    setValue(defaultValue || '');
  }, [defaultValue, open]);
  const handleSubmit = () => {
    if (required && !String(value || '').trim()) return;
    onSubmit && onSubmit(value);
  };
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <SecondaryButton type="button" onClick={onCancel}>{cancelText}</SecondaryButton>
          <PrimaryButton type="button" onClick={handleSubmit}>{submitText}</PrimaryButton>
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{label}</label>
        <Input
          multiline={multiline}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
        />
        {required && !String(value || '').trim() && (
          <small style={{ color: '#b91c1c' }}>Ce champ est requis</small>
        )}
      </div>
    </Modal>
  );
};

export default PromptModal;
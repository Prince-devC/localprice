import React from 'react';
import Modal, { PrimaryButton, SecondaryButton } from './Modal';

// fields: [{ name, label, type: 'text'|'textarea'|'select'|'number', defaultValue, required, options?: [{value,label}] }]
const FieldInput = ({ field, value, onChange }) => {
  const baseStyle = {
    width: '100%',
    padding: '0.6rem 0.85rem',
    border: '1px solid var(--gray-200)',
    borderRadius: '8px',
    background: 'white',
    color: 'var(--gray-800)'
  };
  if (field.type === 'textarea') {
    return (
      <textarea
        style={{ ...baseStyle, minHeight: 90 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select
        style={baseStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {(field.options || []).map((opt) => (
          <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      style={baseStyle}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

const FormModal = ({
  open,
  title = 'Modifier',
  fields = [],
  submitText = 'Enregistrer',
  cancelText = 'Annuler',
  onSubmit,
  onCancel,
  renderExtras
}) => {
  const [values, setValues] = React.useState(() => {
    const init = {};
    (fields || []).forEach((f) => { init[f.name] = f.defaultValue ?? ''; });
    return init;
  });
  React.useEffect(() => {
    const init = {};
    (fields || []).forEach((f) => { init[f.name] = f.defaultValue ?? ''; });
    setValues(init);
  }, [fields, open]);

  const handleChange = (name, v) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  };

  const isValid = () => {
    for (const f of fields || []) {
      if (f.required && !String(values[f.name] ?? '').trim()) return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!isValid()) return;
    onSubmit && onSubmit(values);
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <SecondaryButton type="button" onClick={onCancel}>{cancelText}</SecondaryButton>
          <PrimaryButton type="button" onClick={handleSubmit} disabled={!isValid()}>{submitText}</PrimaryButton>
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {typeof renderExtras === 'function' && (
          <div style={{ marginBottom: '0.5rem' }}>
            {renderExtras(values, setValues)}
          </div>
        )}
        {(fields || []).map((f) => (
          <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{f.label}{f.required ? ' *' : ''}</label>
            <FieldInput
              field={f}
              value={values[f.name]}
              onChange={(v) => handleChange(f.name, v)}
            />
            {f.required && !String(values[f.name] ?? '').trim() && (
              <small style={{ color: '#b91c1c' }}>Ce champ est requis</small>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default FormModal;
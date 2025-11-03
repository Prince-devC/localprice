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
  const isReadOnly = field?.readOnly === true || field?.readonly === true || field?.disabled === true || (field && (field.name === 'product_id' || field.name === 'locality_id'));
  const style = { ...baseStyle, background: isReadOnly ? 'var(--gray-50)' : 'white', color: isReadOnly ? 'var(--gray-700)' : 'var(--gray-800)' };
  if (field.type === 'textarea') {
    return (
      <textarea
        style={{ ...style, minHeight: 90 }}
        value={value}
        readOnly={isReadOnly}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select
        style={style}
        value={value}
        disabled={isReadOnly}
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
      style={style}
      value={value}
      readOnly={isReadOnly}
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

  const [submitting, setSubmitting] = React.useState(false);

  const handleChange = (name, v) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  };

  const isValid = () => {
    for (const f of fields || []) {
      if (f.required && !String(values[f.name] ?? '').trim()) return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isValid() || submitting) return;
    // Omettre les champs non modifiables (produit/localité) du payload
    const payload = {};
    const omit = new Set(['product_id', 'locality_id']);
    Object.keys(values || {}).forEach((k) => {
      if (!omit.has(k)) payload[k] = values[k];
    });
    try {
      setSubmitting(true);
      const result = onSubmit && onSubmit(payload);
      if (result && typeof result.then === 'function') {
        await result;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      actions={(
        <>
          <SecondaryButton type="button" onClick={onCancel}>{cancelText}</SecondaryButton>
          <PrimaryButton type="button" onClick={handleSubmit} disabled={!isValid() || submitting || (typeof submitText === 'string' && /enregistrement/i.test(submitText))} aria-busy={submitting}>
            {submitText}
          </PrimaryButton>
        </>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(() => {
          const hasLockFields = (fields || []).some(f => f.name === 'product_id' || f.name === 'locality_id');
          const accRaw = values && values['geo_accuracy'];
          const accVal = accRaw != null && accRaw !== '' ? parseFloat(accRaw) : null;
          return (
            <>
              {hasLockFields && (
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}>
                  Note: Produit et localité sont en lecture seule et ne seront pas modifiés lors de l'enregistrement.
                </div>
              )}
              {(accVal != null && Number.isFinite(accVal) && accVal > 10) && (
                <div style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412' }}>
                  Précision GPS élevée ({Math.round(accVal)} m). Vérifiez vos coordonnées; la validation peut être refusée.
                </div>
              )}
            </>
          );
        })()}
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
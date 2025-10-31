export function isValidPhone(phone) {
  if (!phone) return false;
  const trimmed = String(phone).trim();
  return /^01\d{8}$/.test(trimmed);
}

export function isValidExperience(exp) {
  if (!exp) return false;
  const v = String(exp).toLowerCase();
  return ['debutant', 'intermediaire', 'expert'].includes(v);
}

export function sanitizeNotes(text) {
  if (!text) return '';
  // Simple sanitize: trim and limit length to 500 chars.
  return String(text).trim().slice(0, 500);
}
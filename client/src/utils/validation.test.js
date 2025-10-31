import { isValidPhone, isValidExperience, sanitizeNotes } from './validation';

describe('validation utils', () => {
  test('isValidPhone accepts valid 01XXXXXXXX format', () => {
    expect(isValidPhone('0100000000')).toBe(true);
    expect(isValidPhone('0199999999')).toBe(true);
  });

  test('isValidPhone rejects invalid formats', () => {
    expect(isValidPhone('0200000000')).toBe(false); // wrong prefix
    expect(isValidPhone('01')).toBe(false); // too short
    expect(isValidPhone('01abcdefgh')).toBe(false); // non-numeric
    expect(isValidPhone('01123456789')).toBe(false); // too long
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone(null)).toBe(false);
  });

  test('isValidExperience accepts allowed values', () => {
    expect(isValidExperience('debutant')).toBe(true);
    expect(isValidExperience('intermediaire')).toBe(true);
    expect(isValidExperience('expert')).toBe(true);
    // Case-insensitive
    expect(isValidExperience('Expert')).toBe(true);
  });

  test('isValidExperience rejects other values', () => {
    expect(isValidExperience('novice')).toBe(false);
    expect(isValidExperience('')).toBe(false);
    expect(isValidExperience(null)).toBe(false);
  });

  test('sanitizeNotes trims and limits length', () => {
    const longText = 'x'.repeat(600);
    const sanitized = sanitizeNotes('  ' + longText + '  ');
    expect(sanitized.length).toBe(500);
    expect(sanitized.startsWith('x')).toBe(true);
  });
});
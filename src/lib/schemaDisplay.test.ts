import { describe, it, expect } from 'vitest';
import { formatFieldLabel } from './schemaDisplay';

describe('formatFieldLabel', () => {
  it('capitalizes simple names', () => {
    expect(formatFieldLabel('name')).toBe('Name');
    expect(formatFieldLabel('email')).toBe('Email');
  });

  it('splits camelCase', () => {
    expect(formatFieldLabel('createdAt')).toBe('Created at');
    expect(formatFieldLabel('isVerified')).toBe('Is verified');
  });
});

import type { FieldType } from '@/types/query';

/** Human-readable column label (e.g. createdAt → Created at). */
export function formatFieldLabel(fieldName: string): string {
  const spaced = fieldName.replace(/([A-Z])/g, ' $1').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const TYPE_BADGE_CLASS: Record<FieldType, string> = {
  string: 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  number: 'bg-violet-500/15 text-violet-800 dark:text-violet-300',
  enum: 'bg-amber-500/15 text-amber-900 dark:text-amber-200',
  date: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  boolean: 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
  array: 'bg-slate-500/15 text-slate-800 dark:text-slate-300',
};

export function fieldTypeBadgeClass(type: FieldType): string {
  return TYPE_BADGE_CLASS[type];
}

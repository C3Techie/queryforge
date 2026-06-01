import { RUN_QUERY_EVENT, TOGGLE_DARK_MODE_EVENT } from '@/lib/constants';

export function dispatchRunQuery(): void {
  window.dispatchEvent(new CustomEvent(RUN_QUERY_EVENT));
}

export function dispatchToggleDarkMode(): void {
  window.dispatchEvent(new CustomEvent(TOGGLE_DARK_MODE_EVENT));
}

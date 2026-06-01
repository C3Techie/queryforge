export const RUN_QUERY_EVENT = 'queryforge:run-query' as const;
export const TOGGLE_DARK_MODE_EVENT = 'queryforge:toggle-dark-mode' as const;

export function dispatchRunQuery(): void {
  window.dispatchEvent(new CustomEvent(RUN_QUERY_EVENT));
}

export function dispatchToggleDarkMode(): void {
  window.dispatchEvent(new CustomEvent(TOGGLE_DARK_MODE_EVENT));
}

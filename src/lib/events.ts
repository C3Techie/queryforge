import {
  RUN_QUERY_EVENT,
  TOGGLE_DARK_MODE_EVENT,
  OPEN_PRESETS_EVENT,
  TRIGGER_IMPORT_EVENT,
  TOGGLE_JSON_VIEW_EVENT,
} from '@/lib/constants';

export function dispatchRunQuery(): void {
  window.dispatchEvent(new CustomEvent(RUN_QUERY_EVENT));
}

export function dispatchToggleDarkMode(): void {
  window.dispatchEvent(new CustomEvent(TOGGLE_DARK_MODE_EVENT));
}

export function dispatchOpenPresets(): void {
  window.dispatchEvent(new CustomEvent(OPEN_PRESETS_EVENT));
}

export function dispatchTriggerImport(): void {
  window.dispatchEvent(new CustomEvent(TRIGGER_IMPORT_EVENT));
}

export function dispatchToggleJsonView(): void {
  window.dispatchEvent(new CustomEvent(TOGGLE_JSON_VIEW_EVENT));
}

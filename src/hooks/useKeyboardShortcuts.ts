import { useEffect } from 'react';
import { useQueryStore } from '@/store/queryStore';
import { dispatchRunQuery, dispatchToggleDarkMode } from '@/lib/events';


function isEditableTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;
  const tag = target.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    target.isContentEditable
  );
}

interface UseKeyboardShortcutsOptions {
  onToggleShortcutsModal: () => void;
}

export function useKeyboardShortcuts({ onToggleShortcutsModal }: UseKeyboardShortcutsOptions): void {
  const { removeNode, undo, selectedNodeId } = useQueryStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'Enter') {
        e.preventDefault();
        dispatchRunQuery();
        return;
      }

      if (ctrl && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }

      if (ctrl && e.key === 'd') {
        e.preventDefault();
        dispatchToggleDarkMode();
        return;
      }

      if (isEditableTarget(e)) return;

      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        removeNode(selectedNodeId);
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        onToggleShortcutsModal();
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [removeNode, undo, selectedNodeId, onToggleShortcutsModal]);
}

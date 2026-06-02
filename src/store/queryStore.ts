import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { current } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { Rule, RuleGroup, QueryNode, Schema, HistoryEntry, Preset } from '@/types/query';
import { MAX_HISTORY, MAX_PRESETS } from '@/lib/constants';
import { schemas } from '@/lib/mock/schema';
import { parseImportedTree } from '@/lib/querySafety';


interface QueryState {
  queryTree: RuleGroup;
  schema: Schema | null;
  undoStack: RuleGroup[];
  queryHistory: HistoryEntry[];
  presets: Preset[];
  selectedNodeId: string | null;

  // Core tree actions
  setSchema: (schema: Schema) => void;
  addRule: (parentGroupId: string) => void;
  addGroup: (parentGroupId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Rule | RuleGroup>) => void;
  removeNode: (nodeId: string) => void;
  setLogicalOperator: (groupId: string, op: 'AND' | 'OR') => void;
  reorderChildren: (parentGroupId: string, fromIndex: number, toIndex: number) => void;
  undo: () => void;
  importTree: (tree: unknown) => void;
  exportTree: () => RuleGroup;
  setSelectedNodeId: (id: string | null) => void;
  clearQuery: () => void;

  // Query history actions
  addHistoryEntry: () => void;
  clearHistory: () => void;
  restoreFromHistory: (id: string) => void;

  // Preset actions
  savePreset: (name: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}


function makeEmptyGroup(): RuleGroup {
  return { id: uuidv4(), type: 'group', logicalOperator: 'AND', children: [] };
}

function makeEmptyRule(): Rule {
  return { id: uuidv4(), type: 'rule', field: '', operator: 'equals', value: '' };
}

function walkTree(
  node: QueryNode,
  parent: RuleGroup | null,
  visitor: (node: QueryNode, parent: RuleGroup | null) => boolean | void
): boolean {
  if (visitor(node, parent)) return true;
  if (node.type === 'group') {
    for (const child of node.children) {
      if (walkTree(child, node, visitor)) return true;
    }
  }
  return false;
}

function addChildToGroup(root: RuleGroup, parentGroupId: string, child: QueryNode): void {
  walkTree(root, null, (node) => {
    if (node.type === 'group' && node.id === parentGroupId) {
      node.children.push(child);
      return true;
    }
  });
}

function applyUpdatesToNode(
  root: RuleGroup,
  nodeId: string,
  updates: Partial<Rule | RuleGroup>
): void {
  walkTree(root, null, (node) => {
    if (node.id === nodeId) {
      Object.assign(node, updates);
      return true;
    }
  });
}

function removeNodeFromTree(root: RuleGroup, nodeId: string): boolean {
  let removed = false;
  walkTree(root, null, (node, parent) => {
    if (node.id === nodeId && parent) {
      const idx = parent.children.findIndex((c) => c.id === nodeId);
      if (idx !== -1) {
        parent.children.splice(idx, 1);
        removed = true;
        return true;
      }
    }
  });
  return removed;
}

function pushUndoStack(state: { undoStack: RuleGroup[]; queryTree: RuleGroup }): void {
  state.undoStack.push(current(state.queryTree));
  if (state.undoStack.length > MAX_HISTORY) {
    state.undoStack.splice(0, state.undoStack.length - MAX_HISTORY);
  }
}

export const useQueryStore = create<QueryState>()(
  immer((set, get) => ({
    queryTree: makeEmptyGroup(),
    schema: null,
    undoStack: [],
    queryHistory: [],
    presets: [],
    selectedNodeId: null,


    setSchema(schema) {
      set((state) => { state.schema = schema; });
    },


    addRule(parentGroupId) {
      set((state) => {
        pushUndoStack(state);
        addChildToGroup(state.queryTree, parentGroupId, makeEmptyRule());
      });
    },

    addGroup(parentGroupId) {
      set((state) => {
        pushUndoStack(state);
        addChildToGroup(state.queryTree, parentGroupId, makeEmptyGroup());
      });
    },

    updateNode(nodeId, updates) {
      set((state) => {
        pushUndoStack(state);
        applyUpdatesToNode(state.queryTree, nodeId, updates);
      });
    },

    removeNode(nodeId) {
      set((state) => {
        pushUndoStack(state);
        if (state.selectedNodeId === nodeId) state.selectedNodeId = null;
        if (state.queryTree.id === nodeId) {
          state.queryTree = makeEmptyGroup();
          return;
        }
        removeNodeFromTree(state.queryTree, nodeId);
      });
    },

    setLogicalOperator(groupId, op) {
      set((state) => {
        pushUndoStack(state);
        applyUpdatesToNode(state.queryTree, groupId, { logicalOperator: op });
      });
    },

    reorderChildren(parentGroupId, fromIndex, toIndex) {
      set((state) => {
        pushUndoStack(state);
        walkTree(state.queryTree, null, (node) => {
          if (node.type === 'group' && node.id === parentGroupId) {
            const children = node.children;
            if (
              fromIndex < 0 || toIndex < 0 ||
              fromIndex >= children.length || toIndex >= children.length
            ) return true;
            const [moved] = children.splice(fromIndex, 1);
            children.splice(toIndex, 0, moved);
            return true;
          }
        });
      });
    },

    undo() {
      set((state) => {
        if (state.undoStack.length === 0) return;
        state.queryTree = state.undoStack.pop()!;
      });
    },

    importTree(tree) {
      const parsed = parseImportedTree(tree);
      if (!parsed.success) return;
      set((state) => {
        pushUndoStack(state);
        state.queryTree = parsed.data;
      });
    },

    exportTree() {
      return structuredClone(get().queryTree);
    },

    setSelectedNodeId(id) {
      set((state) => { state.selectedNodeId = id; });
    },

    clearQuery() {
      set((state) => {
        pushUndoStack(state);
        state.queryTree = makeEmptyGroup();
        state.selectedNodeId = null;
      });
    },


    addHistoryEntry() {
      set((state) => {
        const entry: HistoryEntry = {
          id: uuidv4(),
          tree: current(state.queryTree),
          timestamp: Date.now(),
          schemaName: state.schema?.name,
        };
        state.queryHistory.unshift(entry); // newest first
        if (state.queryHistory.length > MAX_HISTORY) {
          state.queryHistory.splice(MAX_HISTORY);
        }
      });
    },

    clearHistory() {
      set((state) => { state.queryHistory = []; });
    },

    restoreFromHistory(id) {
      const entry = get().queryHistory.find((h) => h.id === id);
      if (!entry) return;
      if (entry.schemaName) {
        const sch = schemas.find((s) => s.name === entry.schemaName);
        if (sch) set((state) => { state.schema = sch; });
      }
      get().importTree(entry.tree);
    },


    savePreset(name) {
      const trimmed = name.trim();
      if (!trimmed) return;
      set((state) => {
        // Prevent duplicate names
        const exists = state.presets.some(
          (p) => p.name.toLowerCase() === trimmed.toLowerCase()
        );
        if (exists) return;

        const preset: Preset = {
          id: uuidv4(),
          name: trimmed,
          tree: current(state.queryTree),
          schemaName: state.schema?.name,
          createdAt: Date.now(),
        };
        state.presets.unshift(preset); // newest first
        if (state.presets.length > MAX_PRESETS) {
          state.presets.splice(MAX_PRESETS);
        }
      });
    },

    loadPreset(id) {
      const preset = get().presets.find((p) => p.id === id);
      if (!preset) return;
      if (preset.schemaName) {
        const sch = schemas.find((s) => s.name === preset.schemaName);
        if (sch) set((state) => { state.schema = sch; });
      }
      get().importTree(preset.tree);
    },

    deletePreset(id) {
      set((state) => {
        const idx = state.presets.findIndex((p) => p.id === id);
        if (idx !== -1) state.presets.splice(idx, 1);
      });
    },
  }))
);

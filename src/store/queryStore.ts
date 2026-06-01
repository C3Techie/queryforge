import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { current } from 'immer';
import { v4 as uuidv4 } from 'uuid';
import type { Rule, RuleGroup, QueryNode, Schema } from '@/types/query';
import { MAX_HISTORY } from '@/lib/constants';

interface QueryState {
  queryTree: RuleGroup;
  schema: Schema | null;
  history: RuleGroup[];
  selectedNodeId: string | null;

  // Actions
  setSchema: (schema: Schema) => void;
  addRule: (parentGroupId: string) => void;
  addGroup: (parentGroupId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Rule | RuleGroup>) => void;
  removeNode: (nodeId: string) => void;
  setLogicalOperator: (groupId: string, op: 'AND' | 'OR') => void;
  reorderChildren: (parentGroupId: string, fromIndex: number, toIndex: number) => void;
  undo: () => void;
  importTree: (tree: RuleGroup) => void;
  exportTree: () => RuleGroup;
  setSelectedNodeId: (id: string | null) => void;
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

function pushHistory(state: { history: RuleGroup[]; queryTree: RuleGroup }): void {
  state.history.push(current(state.queryTree));
  if (state.history.length > MAX_HISTORY) {
    state.history.splice(0, state.history.length - MAX_HISTORY);
  }
}

export const useQueryStore = create<QueryState>()(
  immer((set, get) => ({
    queryTree: makeEmptyGroup(),
    schema: null,
    history: [],
    selectedNodeId: null,

    setSchema(schema) {
      set((state) => {
        state.schema = schema;
      });
    },

    addRule(parentGroupId) {
      set((state) => {
        pushHistory(state);
        addChildToGroup(state.queryTree, parentGroupId, makeEmptyRule());
      });
    },

    addGroup(parentGroupId) {
      set((state) => {
        pushHistory(state);
        addChildToGroup(state.queryTree, parentGroupId, makeEmptyGroup());
      });
    },

    updateNode(nodeId, updates) {
      set((state) => {
        pushHistory(state);
        applyUpdatesToNode(state.queryTree, nodeId, updates);
      });
    },

    removeNode(nodeId) {
      set((state) => {
        pushHistory(state);
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = null;
        }
        if (state.queryTree.id === nodeId) {
          state.queryTree = makeEmptyGroup();
          return;
        }
        removeNodeFromTree(state.queryTree, nodeId);
      });
    },

    setLogicalOperator(groupId, op) {
      set((state) => {
        pushHistory(state);
        applyUpdatesToNode(state.queryTree, groupId, { logicalOperator: op });
      });
    },

    reorderChildren(parentGroupId, fromIndex, toIndex) {
      set((state) => {
        pushHistory(state);
        walkTree(state.queryTree, null, (node) => {
          if (node.type === 'group' && node.id === parentGroupId) {
            const children = node.children;
            if (
              fromIndex < 0 ||
              toIndex < 0 ||
              fromIndex >= children.length ||
              toIndex >= children.length
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
        if (state.history.length === 0) return;
        const prev = state.history.pop()!;
        state.queryTree = prev;
      });
    },

    importTree(tree) {
      set((state) => {
        pushHistory(state);
        state.queryTree = tree;
      });
    },

    exportTree() {
      return structuredClone(get().queryTree);
    },

    setSelectedNodeId(id) {
      set((state) => {
        state.selectedNodeId = id;
      });
    },
  }))
);

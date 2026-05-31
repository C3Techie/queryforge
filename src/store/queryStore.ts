import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { Rule, RuleGroup, QueryNode, Schema } from '@/types/query';

interface QueryState {
  queryTree: RuleGroup;
  schema: Schema | null;

  // Actions
  setSchema: (schema: Schema) => void;
  addRule: (parentGroupId: string) => void;
  addGroup: (parentGroupId: string) => void;
  updateNode: (nodeId: string, updates: Partial<Rule | RuleGroup>) => void;
  removeNode: (nodeId: string) => void;
  setLogicalOperator: (groupId: string, op: 'AND' | 'OR') => void;
  importTree: (tree: RuleGroup) => void;
  exportTree: () => RuleGroup;
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

export const useQueryStore = create<QueryState>()(
  immer((set, get) => ({
    queryTree: makeEmptyGroup(),
    schema: null,

    setSchema(schema) {
      set((state) => {
        state.schema = schema;
      });
    },

    addRule(parentGroupId) {
      set((state) => {
        addChildToGroup(state.queryTree, parentGroupId, makeEmptyRule());
      });
    },

    addGroup(parentGroupId) {
      set((state) => {
        addChildToGroup(state.queryTree, parentGroupId, makeEmptyGroup());
      });
    },

    updateNode(nodeId, updates) {
      set((state) => {
        applyUpdatesToNode(state.queryTree, nodeId, updates);
      });
    },

    removeNode(nodeId) {
      set((state) => {
        // If the root itself is targeted, replace it with a fresh empty group.
        if (state.queryTree.id === nodeId) {
          state.queryTree = makeEmptyGroup();
          return;
        }
        removeNodeFromTree(state.queryTree, nodeId);
      });
    },

    setLogicalOperator(groupId, op) {
      set((state) => {
        applyUpdatesToNode(state.queryTree, groupId, { logicalOperator: op });
      });
    },

    importTree(tree) {
      set((state) => {
        state.queryTree = tree;
      });
    },

    exportTree() {
      return structuredClone(get().queryTree);
    },
  }))
);

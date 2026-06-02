import { describe, it, expect, beforeEach } from 'vitest'
import { useQueryStore } from './queryStore'
import { usersSchema } from '@/lib/mock/schema'
import type { RuleGroup } from '@/types/query'

// Reset store to a fresh state before each test
function getStore() {
  // Access the store's internal state directly via getState()
  return useQueryStore.getState()
}

function resetStore() {
  useQueryStore.setState({
    queryTree: { id: 'root', type: 'group', logicalOperator: 'AND', children: [] },
    schema: null,
    undoStack: [],
    queryHistory: [],
    presets: [],
    selectedNodeId: null,
  })
}

describe('queryStore', () => {
  beforeEach(() => {
    resetStore()
  })

  // ── Initial state ───

  it('initial queryTree is an empty AND group', () => {
    const { queryTree } = getStore()
    expect(queryTree.type).toBe('group')
    expect(queryTree.logicalOperator).toBe('AND')
    expect(queryTree.children).toHaveLength(0)
  })

  it('initial schema is null', () => {
    expect(getStore().schema).toBeNull()
  })

  // ── setSchema ───

  it('setSchema updates the schema', () => {
    getStore().setSchema(usersSchema)
    expect(getStore().schema).toEqual(usersSchema)
  })

  // ── addRule ───

  it('addRule adds a rule to the root group', () => {
    const { queryTree, addRule } = getStore()
    addRule(queryTree.id)
    const updated = getStore().queryTree
    expect(updated.children).toHaveLength(1)
    expect(updated.children[0].type).toBe('rule')
  })

  it('addRule adds to a nested group by ID', () => {
    const { queryTree, addGroup, addRule } = getStore()
    addGroup(queryTree.id)
    const nestedGroup = getStore().queryTree.children[0] as RuleGroup
    addRule(nestedGroup.id)
    const nested = getStore().queryTree.children[0] as RuleGroup
    expect(nested.children).toHaveLength(1)
    expect(nested.children[0].type).toBe('rule')
  })

  // ── addGroup ───

  it('addGroup adds a nested group', () => {
    const { queryTree, addGroup } = getStore()
    addGroup(queryTree.id)
    const updated = getStore().queryTree
    expect(updated.children).toHaveLength(1)
    expect(updated.children[0].type).toBe('group')
  })

  // ── updateNode ───

  it('updateNode updates a rule field', () => {
    const { queryTree, addRule, updateNode } = getStore()
    addRule(queryTree.id)
    const rule = getStore().queryTree.children[0]
    updateNode(rule.id, { field: 'age' })
    const updated = getStore().queryTree.children[0]
    expect((updated as { field: string }).field).toBe('age')
  })

  it('updateNode updates logicalOperator on a group', () => {
    const { queryTree, setLogicalOperator } = getStore()
    setLogicalOperator(queryTree.id, 'OR')
    expect(getStore().queryTree.logicalOperator).toBe('OR')
  })

  // ── removeNode ────

  it('removeNode removes a rule from its parent', () => {
    const { queryTree, addRule, removeNode } = getStore()
    addRule(queryTree.id)
    const rule = getStore().queryTree.children[0]
    removeNode(rule.id)
    expect(getStore().queryTree.children).toHaveLength(0)
  })

  it('removing root group replaces it with a fresh empty group', () => {
    const { queryTree, removeNode } = getStore()
    const originalId = queryTree.id
    removeNode(originalId)
    const newTree = getStore().queryTree
    expect(newTree.type).toBe('group')
    expect(newTree.children).toHaveLength(0)
    expect(newTree.id).not.toBe(originalId)
  })

  it('removeNode clears selectedNodeId if it matches', () => {
    const { queryTree, addRule, setSelectedNodeId, removeNode } = getStore()
    addRule(queryTree.id)
    const rule = getStore().queryTree.children[0]
    setSelectedNodeId(rule.id)
    expect(getStore().selectedNodeId).toBe(rule.id)
    removeNode(rule.id)
    expect(getStore().selectedNodeId).toBeNull()
  })

  // ── reorderChildren ────

  it('reorderChildren moves a child from one index to another', () => {
    const { queryTree, addRule, reorderChildren } = getStore()
    addRule(queryTree.id)
    addRule(queryTree.id)
    addRule(queryTree.id)
    const before = getStore().queryTree.children.map((c) => c.id)
    reorderChildren(queryTree.id, 0, 2)
    const after = getStore().queryTree.children.map((c) => c.id)
    expect(after[2]).toBe(before[0])
    expect(after[0]).toBe(before[1])
  })

  // ── importTree / exportTree ────

  it('exportTree returns a deep clone of the current tree', () => {
    const { queryTree, addRule, exportTree } = getStore()
    addRule(queryTree.id)
    const exported = exportTree()
    expect(exported).toEqual(getStore().queryTree)
    // Mutating the export should not affect the store
    exported.children = []
    expect(getStore().queryTree.children).toHaveLength(1)
  })

  it('importTree replaces the query tree', () => {
    const newTree: RuleGroup = {
      id: 'imported',
      type: 'group',
      logicalOperator: 'OR',
      children: [],
    }
    getStore().importTree(newTree)
    expect(getStore().queryTree.id).toBe('imported')
    expect(getStore().queryTree.logicalOperator).toBe('OR')
  })

  it('importTree rejects invalid trees', () => {
    const originalId = getStore().queryTree.id
    getStore().importTree({ type: 'rule', id: 'bad' })
    // Tree should be unchanged
    expect(getStore().queryTree.id).toBe(originalId)
  })

  it('importTree rejects malformed nested groups', () => {
    const originalId = getStore().queryTree.id
    // missing logicalOperator in nested group
    getStore().importTree({
      id: 'root',
      type: 'group',
      logicalOperator: 'AND',
      children: [{ id: 'child-group', type: 'group', children: [] }],
    })
    expect(getStore().queryTree.id).toBe(originalId)
  })

  // ── undo ────

  it('undo reverts the last mutation', () => {
    const { queryTree, addRule, undo } = getStore()
    addRule(queryTree.id)
    expect(getStore().queryTree.children).toHaveLength(1)
    undo()
    expect(getStore().queryTree.children).toHaveLength(0)
  })

  it('undo does nothing when history is empty', () => {
    const originalId = getStore().queryTree.id
    getStore().undo()
    expect(getStore().queryTree.id).toBe(originalId)
  })

  // ── presets ────

  it('savePreset saves the current tree with a name', () => {
    getStore().setSchema(usersSchema)
    getStore().savePreset('My Preset')
    const { presets } = getStore()
    expect(presets).toHaveLength(1)
    expect(presets[0].name).toBe('My Preset')
  })

  it('savePreset rejects empty name', () => {
    getStore().savePreset('')
    expect(getStore().presets).toHaveLength(0)
  })

  it('savePreset rejects duplicate name', () => {
    getStore().savePreset('Dup')
    getStore().savePreset('Dup')
    expect(getStore().presets).toHaveLength(1)
  })

  it('loadPreset restores the saved tree', () => {
    const { queryTree, addRule, savePreset } = getStore()
    addRule(queryTree.id)
    savePreset('With Rule')
    const presetId = getStore().presets[0].id
    const savedTree = getStore().presets[0].tree

    // Clear the tree but keep presets intact
    useQueryStore.setState((s) => ({
      ...s,
      queryTree: { id: 'root', type: 'group', logicalOperator: 'AND', children: [] },
    }))
    expect(getStore().queryTree.children).toHaveLength(0)

    // Load preset
    getStore().loadPreset(presetId)
    expect(getStore().queryTree.children).toHaveLength(savedTree.children.length)
  })

  it('deletePreset removes the preset', () => {
    getStore().savePreset('ToDelete')
    const id = getStore().presets[0].id
    getStore().deletePreset(id)
    expect(getStore().presets).toHaveLength(0)
  })

  // ── query history ────

  it('addHistoryEntry records the current tree', () => {
    getStore().setSchema(usersSchema)
    getStore().addHistoryEntry()
    expect(getStore().queryHistory).toHaveLength(1)
    expect(getStore().queryHistory[0].schemaName).toBe('Users')
  })

  it('clearHistory empties the history', () => {
    getStore().addHistoryEntry()
    getStore().clearHistory()
    expect(getStore().queryHistory).toHaveLength(0)
  })

  it('restoreFromHistory restores a previous tree', () => {
    const { queryTree, addRule, addHistoryEntry, restoreFromHistory } = getStore()
    addHistoryEntry() // save empty state
    addRule(queryTree.id)
    expect(getStore().queryTree.children).toHaveLength(1)
    const entryId = getStore().queryHistory[0].id
    restoreFromHistory(entryId)
    expect(getStore().queryTree.children).toHaveLength(0)
  })

  // ── selectedNodeId ────

  it('setSelectedNodeId updates selection', () => {
    getStore().setSelectedNodeId('abc')
    expect(getStore().selectedNodeId).toBe('abc')
    getStore().setSelectedNodeId(null)
    expect(getStore().selectedNodeId).toBeNull()
  })
})

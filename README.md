# QueryForge

QueryForge is a visual query builder built with Next.js App Router and TypeScript. It lets users build deeply nested filters, preview generated query syntax (SQL, Mongo, GraphQL), execute queries against a mock dataset, and inspect results without writing raw query code.

## Objective and Scope

The project is designed for advanced frontend systems engineering:
- Recursive query-group UI with unlimited nesting
- Schema-driven field/operator/value controls
- Real-time query preview and execution simulator
- Query history, presets, import/export, and keyboard shortcuts
- Strong validation and safe query-generation boundaries

## Architecture Overview

Core layers:
- UI layer: recursive builder, preview, results, and side panels
- State layer: global immutable query tree actions via Zustand + Immer
- Domain layer: schema metadata, validation, generators, execution engine
- Safety layer: import validation and generator sanitization helpers

Key paths:
- `src/components/query-builder` recursive builder components
- `src/store/queryStore.ts` tree state/actions, history, presets
- `src/lib/validation/validateNode.ts` query validation rules
- `src/lib/query-generator` SQL/Mongo/GraphQL generation
- `src/lib/execution/executeQuery.ts` simulated execution
- `src/lib/querySafety.ts` import and sanitization guardrails

## Recursive Rendering Strategy

The builder uses a recursive node renderer where each query node is either:
- a `rule` node: field + operator + value
- a `group` node: logical operator (`AND`/`OR`) + children

`QueryNodeRenderer` delegates:
- rule nodes to `RuleRow`
- group nodes to `GroupContainer`, which recursively renders child nodes

This keeps rendering extensible while preserving a normalized tree structure.

## State Management Decisions

State is managed in `queryStore` with Zustand + Immer:
- `queryTree` is the single source of truth
- tree updates are immutable and centralized (add/remove/update/reorder)
- undo/history and presets are maintained in store-level collections
- actions operate by tree traversal, allowing deep updates without prop drilling

Why this design:
- predictable updates for nested structures
- easy to test pure domain logic + store actions
- scalable for additional query node types or execution backends

## Query Engine Design

The domain layer converts a shared query tree into multiple outputs:
- SQL-like preview (`treeToSQL`)
- Mongo-style object (`treeToMongo`)
- GraphQL filter object (`treeToGraphQL`)

Execution simulation:
- `executeQuery` traverses the same query tree and filters local mock data
- supports nested AND/OR groups and relational field paths

Validation:
- `validateNode` enforces field/operator compatibility and value requirements
- invalid groups (for example, empty groups) are flagged recursively

Safety hardening:
- imported JSON is validated recursively via `parseImportedTree`
- field paths are sanitized before generation
- operator allowlists are enforced at generation boundaries
- SQL string escaping and regex escaping are applied where needed

## Performance Optimization Techniques

Implemented techniques:
- `React.memo` for builder subtrees and reusable rows
- `useMemo` / `useCallback` on hot interaction paths
- normalized query tree for localized updates
- immutable updates with Immer to avoid accidental mutations
- stable IDs for keys and drag/reorder behavior

Trade-off:
- favors correctness and architecture clarity first; can be extended with list virtualization for very large trees/results.

## Advanced Interactions

Included interactions:
- drag-and-drop condition/group reordering
- keyboard shortcuts modal + global shortcut handlers
- collapsible groups and preview panes
- query history panel and restore flow
- saved presets
- query import/export JSON
- dark/light mode toggle
- animated transitions

## Security and Stability Notes

Defensive measures:
- strict recursive parsing for imported query JSON
- malformed/unsafe field paths are rejected
- incompatible operators are blocked by validation and generator guards
- SQL values and regex literals are escaped before query output generation

Important note:
- Query generation is for preview/simulation, not direct database execution. If connected to a backend later, keep server-side validation and parameterized execution mandatory.

## Setup

Prerequisites:
- Node.js 20+
- pnpm 9+

Install and run:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev` start local development server
- `pnpm lint` run lint checks
- `pnpm typecheck` run TypeScript checks
- `pnpm test` run test suites
- `pnpm test:coverage` run tests with enforced coverage thresholds
- `pnpm build` create production build

## Testing Strategy

Testing focuses on correctness of complex system behavior:
- query generation logic (SQL/Mongo/GraphQL)
- recursive validation behavior
- store logic (tree mutation, import/export, undo, presets, history)
- execution simulation logic
- sanitization/import safety helpers

Coverage thresholds (Vitest):
- lines: 60%
- statements: 60%
- functions: 60%
- branches: 50%

## Deployment and CI

CI (`.github/workflows/ci.yml`) runs:
- lint
- typecheck
- tests with coverage thresholds
- production build sanity check

CD uses Vercel in `.github/workflows/cd.yml` with repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Engineering Workflow

Recommended workflow:
1. create a focused feature branch from `main`
2. ship small, reviewable pull requests
3. keep commits descriptive and scoped
4. merge via PR only (no direct pushes to main)

For this stage, split implementation into at least 7 meaningful PRs.

## Trade-offs and Future Enhancements

Current trade-offs:
- preview-first query generation instead of backend-bound execution
- in-memory state/history for fast UX over persistence complexity

Suggested next improvements:
- persistent history/presets (local storage or backend)
- richer keyboard-only query editing flows
- result and tree virtualization for very large workloads
- stricter schema-level validation with richer user-facing error mapping

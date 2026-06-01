"use client"

import * as React from "react"
import { useState, useCallback, useEffect, useMemo } from "react"
import { Play, ChevronLeft, ChevronRight, Check, X as XIcon } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { datasetMap } from "@/lib/mock/dataset"
import { runQuery } from "@/lib/execution/executeQuery"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { RESULTS_PAGE_SIZE } from "@/lib/constants"
import { RUN_QUERY_EVENT } from "@/lib/constants"
import { cn } from "@/lib/utils"


function getColumns(schema: { fields: { name: string; type: string }[] } | null) {
  if (!schema) return []
  // Show up to 6 fields — always include id first if present
  const fields = schema.fields
  const idField = fields.find(f => f.name === 'id')
  const rest = fields.filter(f => f.name !== 'id').slice(0, 5)
  const selected = idField ? [idField, ...rest] : fields.slice(0, 6)
  return selected.map(f => ({ key: f.name, label: f.name.charAt(0).toUpperCase() + f.name.slice(1), type: f.type }))
}

function CellValue({ value, type }: { value: unknown; type: string }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic text-xs">null</span>
  }

  if (type === 'boolean') {
    return value
      ? <Check className="size-4 text-primary" />
      : <XIcon className="size-4 text-muted-foreground" />
  }

  if (type === 'enum') {
    return <Badge variant="default">{String(value)}</Badge>
  }

  if (type === 'array') {
    const arr = Array.isArray(value) ? value : []
    return (
      <span className="text-xs text-muted-foreground">
        {arr.length === 0 ? '—' : arr.join(', ')}
      </span>
    )
  }

  if (type === 'number') {
    return (
      <span className="font-code-sm text-code-sm text-on-surface">
        {String(value)}
      </span>
    )
  }

  return <span className="truncate max-w-[120px] block">{String(value)}</span>
}

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <TableRow>
      {Array.from({ length: colCount }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 rounded bg-surface-container animate-pulse-loading" />
        </TableCell>
      ))}
    </TableRow>
  )
}

type SortDir = 'asc' | 'desc'

export function ResultsPanel() {
  const { queryTree, schema, addHistoryEntry } = useQueryStore()

  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  // Derive columns from active schema
  const columns = useMemo(() => getColumns(schema), [schema])

  // Reset results when schema changes
  useEffect(() => {
    setRows(null)
    setPage(0)
    setSortKey(null)
  }, [schema?.name])

  // Get the dataset for the active schema
  const activeDataset = useMemo(() => {
    if (!schema) return []
    return datasetMap[schema.name] ?? []
  }, [schema])

  const handleRun = useCallback(async () => {
    setLoading(true)
    setPage(0)
    addHistoryEntry()
    await new Promise((r) => setTimeout(r, 300))
    const result = runQuery(queryTree, activeDataset)
    setRows(result.rows)
    setLoading(false)
  }, [queryTree, addHistoryEntry, activeDataset])

  useEffect(() => {
    const handler = () => { void handleRun() }
    window.addEventListener(RUN_QUERY_EVENT, handler)
    return () => window.removeEventListener(RUN_QUERY_EVENT, handler)
  }, [handleRun])

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return key
      }
      setSortDir('asc')
      return key
    })
  }, [])

  const sortedRows = useMemo(() => {
    if (!rows || !sortKey) return rows
    return [...rows].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  const totalRows = sortedRows?.length ?? 0
  const totalPages = Math.ceil(totalRows / RESULTS_PAGE_SIZE)
  const pageRows = sortedRows?.slice(page * RESULTS_PAGE_SIZE, (page + 1) * RESULTS_PAGE_SIZE) ?? []

  return (
    <div className="flex flex-1 w-full border-l border-border bg-surface dark:bg-surface-dim flex-col transition-colors duration-200 overflow-hidden">

      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center gap-2 bg-surface-bright shrink-0 flex-wrap">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Query Results
          </h2>
          {schema && (
            <p className="font-body-sm text-body-sm text-muted-foreground mt-0.5">
              {schema.name} · {activeDataset.length} records
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={loading || !schema}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-label-caps text-label-caps shadow-sm transition-colors cursor-pointer",
            "bg-primary text-primary-foreground hover:bg-primary-container hover:text-on-primary-container",
            "disabled:opacity-50 disabled:pointer-events-none"
          )}
        >
          <Play className="size-3.5" />
          Run Query
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">

        {/* Loading */}
        {loading && (
          <div className="p-4">
            <div className="text-body-sm text-muted-foreground mb-3">Running query…</div>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} colCount={columns.length} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* No query run yet */}
        {!loading && rows === null && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
            <div className="p-3 bg-surface-container-high rounded-full">
              <Play className="size-6 text-primary" />
            </div>
            <p className="font-body-sm text-body-sm text-muted-foreground max-w-[240px] leading-relaxed">
              Build your query and click <strong>Run Query</strong> to see matching records.
            </p>
          </div>
        )}

        {/* Empty results */}
        {!loading && rows !== null && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
            <div className="p-3 bg-surface-container-high rounded-full">
              <XIcon className="size-6 text-muted-foreground" />
            </div>
            <p className="font-body-sm text-body-sm text-muted-foreground">
              No records match this query.
            </p>
          </div>
        )}

        {/* Results table */}
        {!loading && rows !== null && rows.length > 0 && (
          <div className="p-4 flex flex-col gap-3 min-w-0">
            {/* Meta */}
            <div className="flex justify-between items-center text-body-sm text-muted-foreground flex-wrap gap-1">
              <span>Showing {pageRows.length} of {totalRows} record{totalRows !== 1 ? 's' : ''}</span>
              <span>Schema: {schema?.name}</span>
            </div>

            {/* Table */}
            <div className="bg-surface-container-lowest border border-border rounded-lg overflow-x-auto shadow-sm w-full">
              <div style={{ minWidth: `${columns.length * 100}px` }}>
                <Table>
                  <TableHeader className="bg-surface-container-low border-b border-border">
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead
                          key={col.key}
                          className="cursor-pointer select-none hover:text-primary transition-colors whitespace-nowrap"
                          onClick={() => handleSort(col.key)}
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            {sortKey === col.key && (
                              <span className="text-[10px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                            )}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.map((row, rowIdx) => (
                      <TableRow
                        key={String(row.id ?? rowIdx)}
                        className="border-b border-border hover:bg-surface-bright transition-colors"
                      >
                        {columns.map((col) => (
                          <TableCell key={col.key} className="whitespace-nowrap">
                            <CellValue value={row[col.key]} type={col.type} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-body-sm text-muted-foreground gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" /> Prev
                </button>
                <span className="shrink-0">Page {page + 1} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-surface-container disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Next <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

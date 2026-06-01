"use client"

import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import { Play, ChevronLeft, ChevronRight, Check, X as XIcon } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { usersDataset } from "@/lib/mock/dataset"
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
import { RESULTS_PAGE_SIZE, RESULTS_COLUMNS } from "@/lib/constants"
import { RUN_QUERY_EVENT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { UserRecord } from "@/lib/mock/dataset"


function SkeletonRow() {
  return (
    <TableRow>
      {RESULTS_COLUMNS.map((col) => (
        <TableCell key={col.key}>
          <div className="h-4 rounded bg-surface-container animate-pulse-loading" />
        </TableCell>
      ))}
    </TableRow>
  )
}


function CellValue({ col, row }: { col: keyof UserRecord; row: UserRecord }) {
  const value = row[col]

  if (col === 'id') {
    return (
      <span className="font-code-sm text-code-sm text-muted-foreground">
        {String(value)}
      </span>
    )
  }

  if (col === 'status') {
    return (
      <Badge variant="default">
        {String(value)}
      </Badge>
    )
  }

  if (col === 'isVerified') {
    return value ? (
      <Check className="size-4 text-primary" />
    ) : (
      <XIcon className="size-4 text-muted-foreground" />
    )
  }

  return <span>{String(value)}</span>
}


type SortDir = 'asc' | 'desc'

export function ResultsPanel() {
  const { queryTree, schema, addHistoryEntry } = useQueryStore()

  const [rows, setRows] = useState<UserRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<keyof UserRecord | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleRun = useCallback(async () => {
    setLoading(true)
    setPage(0)
    addHistoryEntry()
    await new Promise((r) => setTimeout(r, 300))
    const result = runQuery(
      queryTree,
      usersDataset as unknown as Record<string, unknown>[]
    )
    setRows(result.rows as unknown as UserRecord[])
    setLoading(false)
  }, [queryTree, addHistoryEntry])

  useEffect(() => {
    const handler = () => { void handleRun() }
    window.addEventListener(RUN_QUERY_EVENT, handler)
    return () => window.removeEventListener(RUN_QUERY_EVENT, handler)
  }, [handleRun])

  const handleSort = useCallback((key: keyof UserRecord) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return key
      }
      setSortDir('asc')
      return key
    })
  }, [])

  // Sort rows
  const sortedRows = React.useMemo(() => {
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

      {/* Header — shrink-0 so it never grows, flex-wrap so button stays on screen */}
      <div className="p-4 border-b border-border flex justify-between items-center gap-2 bg-surface-bright shrink-0 flex-wrap">
        <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
          Query Results
        </h2>
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
        {/* Loading skeleton */}
        {loading && (
          <div className="p-4">
            <div className="text-body-sm text-muted-foreground mb-3">Running query…</div>
            <Table>
              <TableHeader>
                <TableRow>
                  {RESULTS_COLUMNS.map((col) => (
                    <TableHead key={col.key}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} />
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
              <span>
                Showing {pageRows.length} of {totalRows} record{totalRows !== 1 ? 's' : ''}
              </span>
              <span>Schema: {schema?.name ?? 'Users'}</span>
            </div>

            {/* Table — scrolls horizontally, never pushes panel wider */}
            <div className="bg-surface-container-lowest border border-border rounded-lg overflow-x-auto shadow-sm w-full">
              <div className="min-w-[480px]">
              <Table>
                <TableHeader className="bg-surface-container-low border-b border-border">
                  <TableRow>
                    {RESULTS_COLUMNS.map((col) => (
                      <TableHead
                        key={col.key}
                        className="cursor-pointer select-none hover:text-primary transition-colors"
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
                  {pageRows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b border-border hover:bg-surface-bright transition-colors"
                    >
                      {RESULTS_COLUMNS.map((col) => (
                        <TableCell key={col.key}>
                          <CellValue col={col.key} row={row} />
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
                <span className="shrink-0">
                  Page {page + 1} of {totalPages}
                </span>
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

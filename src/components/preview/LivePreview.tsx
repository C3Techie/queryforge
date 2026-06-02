"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useQueryStore } from "@/store/queryStore"
import { treeToSQL } from "@/lib/query-generator/treeToSQL"
import { treeToMongoString } from "@/lib/query-generator/treeToMongo"
import { treeToGraphQLString } from "@/lib/query-generator/treeToGraphQL"
import {
  SQL_KEYWORDS_REGEX,
  SQL_STRINGS_REGEX,
  SQL_NUMBERS_REGEX,
  JSON_TOKEN_REGEX,
  PREVIEW_TABS,
  type PreviewTab,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

function highlightSQL(sql: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  let remaining = sql;
  let key = 0;

  while (remaining.length > 0) {
    const kwMatch = SQL_KEYWORDS_REGEX.exec(remaining);
    const strMatch = SQL_STRINGS_REGEX.exec(remaining);
    const numMatch = SQL_NUMBERS_REGEX.exec(remaining);

    SQL_KEYWORDS_REGEX.lastIndex = 0;
    SQL_STRINGS_REGEX.lastIndex = 0;
    SQL_NUMBERS_REGEX.lastIndex = 0;

    const candidates = [
      kwMatch && { index: kwMatch.index, length: kwMatch[0].length, type: 'keyword', text: kwMatch[0] },
      strMatch && { index: strMatch.index, length: strMatch[0].length, type: 'string', text: strMatch[0] },
      numMatch && { index: numMatch.index, length: numMatch[0].length, type: 'number', text: numMatch[0] },
    ].filter(Boolean) as { index: number; length: number; type: string; text: string }[];

    if (candidates.length === 0) {
      segments.push(<span key={key++}>{remaining}</span>);
      break;
    }

    candidates.sort((a, b) => a.index - b.index);
    const first = candidates[0];

    if (first.index > 0) {
      segments.push(<span key={key++}>{remaining.slice(0, first.index)}</span>);
    }

    if (first.type === 'keyword') {
      segments.push(<span key={key++} className="text-primary font-bold">{first.text}</span>);
    } else if (first.type === 'string') {
      segments.push(<span key={key++} className="text-tertiary-container">{first.text}</span>);
    } else {
      segments.push(<span key={key++} className="text-secondary">{first.text}</span>);
    }

    remaining = remaining.slice(first.index + first.length);
  }

  return segments;
}


function highlightJSON(text: string): React.ReactNode[] {
  const segments: React.ReactNode[] = [];
  // Clone the regex so we don't share lastIndex state across calls
  const TOKEN = new RegExp(JSON_TOKEN_REGEX.source, JSON_TOKEN_REGEX.flags);
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) {
      segments.push(<span key={key++}>{text.slice(last, m.index)}</span>);
    }
    if (m[1]) {
      const after = text.slice(m.index + m[0].length).trimStart();
      if (after.startsWith(':')) {
        segments.push(<span key={key++} className="text-primary font-semibold">{m[0]}</span>);
      } else {
        segments.push(<span key={key++} className="text-tertiary-container">{m[0]}</span>);
      }
    } else if (m[2]) {
      segments.push(<span key={key++} className="text-secondary">{m[0]}</span>);
    } else if (m[3]) {
      segments.push(<span key={key++} className="text-primary font-bold">{m[0]}</span>);
    } else if (m[4]) {
      segments.push(<span key={key++} className="text-primary font-bold">{m[0]}</span>);
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) {
    segments.push(<span key={key++}>{text.slice(last)}</span>);
  }

  return segments;
}


export function LivePreview() {
  const { queryTree, schema } = useQueryStore()
  const [activeTab, setActiveTab] = useState<PreviewTab>('SQL')
  const [collapsed, setCollapsed] = useState(false)

  const sql = useMemo(
    () => (schema ? treeToSQL(queryTree, schema) : '-- No schema loaded'),
    [queryTree, schema]
  )

  const mongo = useMemo(
    () => (schema ? treeToMongoString(queryTree, schema) : '// No schema loaded'),
    [queryTree, schema]
  )

  const graphql = useMemo(
    () => (schema ? treeToGraphQLString(queryTree, schema) : '# No schema loaded'),
    [queryTree, schema]
  )

  const content = activeTab === 'SQL' ? sql : activeTab === 'MongoDB' ? mongo : graphql
  const highlighted = activeTab === 'SQL' ? highlightSQL(content) : highlightJSON(content)

  return (
    <div
      className={cn(
        "border-t border-border bg-surface-container-lowest shrink-0 flex flex-col transition-all duration-300",
        collapsed ? "h-10" : "h-full lg:h-48"
      )}
    >
      {/* Tab bar */}
      <div className="flex border-b border-border px-4 bg-surface-bright items-center justify-between shrink-0 h-10">
        <div className="flex gap-4">
          {PREVIEW_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-2 px-1 font-label-caps text-label-caps transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-on-surface"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="p-1 rounded text-muted-foreground hover:text-on-surface hover:bg-surface-container transition-colors"
          aria-label={collapsed ? "Expand preview" : "Collapse preview"}
        >
          {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {/* Code block */}
      {!collapsed && (
        <div className="flex-1 overflow-auto no-scrollbar bg-surface-dim shadow-inner relative group">
          <pre className="p-4 m-0 font-code-md text-code-md text-on-surface leading-relaxed whitespace-pre-wrap break-words">
            {highlighted}
          </pre>
          {/* Shimmer overlay on hover */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 code-shimmer animate-shimmer" />
        </div>
      )}
    </div>
  )
}

import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useRailConnections, type RailConnection } from './railConnectionsContext'

const VISIBLE_CONNECTION_LIMIT = 6
const CONNECTION_STATE_PRIORITY: Record<RailConnection['state'], number> = {
  off: 0,
  partial: 1,
  live: 2,
}

export function RailLabel({ children }: { children: ReactNode }) {
  return (
    <span className="rail-label text-[11px] font-medium tracking-[0.02em] text-lb-rail-label">
      {children}
    </span>
  )
}

function connectionDotClass(state: RailConnection['state']): string {
  const base = 'h-[7px] w-[7px] shrink-0 rounded-full'
  if (state === 'live') return `${base} bg-lb-rail-good`
  if (state === 'partial') return `${base} bg-lb-rail-info`
  return `${base} border border-lb-rail-muted`
}

function visibleConnections(rows: RailConnection[]): RailConnection[] {
  return rows
    .map((row, index) => ({ row, index }))
    .toSorted((a, b) => CONNECTION_STATE_PRIORITY[a.row.state]
      - CONNECTION_STATE_PRIORITY[b.row.state] || a.index - b.index)
    .slice(0, VISIBLE_CONNECTION_LIMIT)
    .map(({ row }) => row)
}

function RailConnectionsSkeleton({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div aria-label="Loading connections" className="flex flex-col items-center gap-3 py-2">
        {[0, 1, 2].map((index) => (
          <span key={index} className="h-[7px] w-[7px] rounded-full bg-lb-rail-active animate-pulse" />
        ))}
      </div>
    )
  }
  return (
    <div aria-label="Loading connections" className="mt-2 flex flex-col gap-2.5">
      {[0, 1, 2].map((index) => (
        <div key={index} className="flex h-4 items-center gap-2 animate-pulse">
          <span className="h-[7px] w-[7px] rounded-full bg-lb-rail-active" />
          <span className="h-2.5 flex-1 rounded-full bg-lb-rail-active" />
          <span className="h-2.5 w-10 rounded-full bg-lb-rail-active" />
        </div>
      ))}
    </div>
  )
}

function ConnectionsUnavailable({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <span className={connectionDotClass('off')} title="Connection status unavailable" />
      </div>
    )
  }
  return (
    <p className="mt-2 text-[12px] leading-4 text-lb-rail-muted">
      Connection status unavailable
    </p>
  )
}

export default function RailConnections({ collapsed = false }: { collapsed?: boolean }) {
  const { rows } = useRailConnections()
  const visible = rows ? visibleConnections(rows) : null

  if (collapsed) {
    return (
      <section aria-label="Connections" className="shrink-0 border-t border-lb-rail-line px-2 py-2">
        {visible === null ? (
          <RailConnectionsSkeleton collapsed />
        ) : visible.length === 0 ? (
          <ConnectionsUnavailable collapsed />
        ) : (
          <div className="flex flex-col items-center gap-3 py-2">
            {visible.map((row) => (
              <span
                key={row.id}
                className={connectionDotClass(row.state)}
                title={`${row.name}: ${row.detail}`}
              />
            ))}
          </div>
        )}
      </section>
    )
  }

  return (
    <section aria-label="Connections" className="shrink-0 border-t border-lb-rail-line px-3 py-3">
      <RailLabel>Connections</RailLabel>
      {visible === null ? (
        <RailConnectionsSkeleton collapsed={false} />
      ) : visible.length === 0 ? (
        <ConnectionsUnavailable collapsed={false} />
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {visible.map((row) => (
            <div key={row.id} className="flex min-w-0 items-center gap-2 text-[12.5px] leading-4">
              <span className={connectionDotClass(row.state)} aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-lb-rail-ink-2">{row.name}</span>
              <span className="max-w-[84px] truncate text-right text-[11px] text-lb-rail-muted">{row.detail}</span>
            </div>
          ))}
        </div>
      )}
      <Link
        to="/connections"
        className="mt-2 flex min-h-10 items-center text-[12px] font-medium text-lb-rail-label transition-colors hover:text-lb-rail-ink max-md:min-h-11"
      >
        All connections
      </Link>
    </section>
  )
}

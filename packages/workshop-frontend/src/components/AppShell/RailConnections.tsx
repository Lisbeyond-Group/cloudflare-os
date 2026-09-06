import { CaretRight, ShareNetwork } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useRailConnections } from './railConnectionsContext'

export function RailLabel({ children }: { children: ReactNode }) {
  return (
    <span className="rail-label text-[11px] font-medium tracking-[0.02em] text-lb-rail-label">
      {children}
    </span>
  )
}

export default function RailConnections({ collapsed = false }: { collapsed?: boolean }) {
  const { rows } = useRailConnections()
  const summary = rows === null
    ? 'Status unknown'
    : rows.length === 0
      ? 'Unavailable'
      : `${rows.filter((row) => row.state === 'live').length} connected`
  const accessibleLabel = `Connections · ${summary}`

  return (
    <section aria-label="Connections" className="shrink-0 border-t border-lb-rail-line px-2 py-2">
      <Link
        to="/connections"
        aria-label={accessibleLabel}
        title={collapsed ? accessibleLabel : undefined}
        className={[
          'group flex h-10 items-center rounded-lg text-[12.5px] leading-4 text-lb-rail-ink-2 transition-[background-color,color] hover:bg-lb-rail-active hover:text-lb-rail-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-rail-label max-md:h-11',
          collapsed ? 'w-10 justify-center max-md:w-11' : 'w-full gap-2 px-2',
        ].join(' ')}
      >
        <ShareNetwork
          size={15}
          weight="regular"
          className="shrink-0"
          aria-hidden="true"
        />
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate">
              Connections <span className="tabular-nums text-lb-rail-muted">· {summary}</span>
            </span>
            <CaretRight
              size={12}
              weight="bold"
              className="shrink-0 text-lb-rail-muted group-hover:text-lb-rail-ink"
              aria-hidden="true"
            />
          </>
        )}
      </Link>
    </section>
  )
}

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type RailConnectionState = 'live' | 'partial' | 'off'

export type RailConnection = {
  id: string
  name: string
  state: RailConnectionState
  detail: string
}

type RailConnectionsContextValue = {
  rows: RailConnection[] | null
  reportConnections: (rows: RailConnection[]) => void
}

const RailConnectionsContext = createContext<RailConnectionsContextValue | null>(null)

export function RailConnectionsProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<RailConnection[] | null>(null)
  const reportConnections = useCallback((nextRows: RailConnection[]) => setRows(nextRows), [])
  const value = useMemo(
    () => ({ rows, reportConnections }),
    [reportConnections, rows],
  )
  return createElement(RailConnectionsContext.Provider, { value }, children)
}

export function useRailConnections(): RailConnectionsContextValue {
  const context = useContext(RailConnectionsContext)
  if (!context) throw new Error('Rail connections must be used within RailConnectionsProvider')
  return context
}

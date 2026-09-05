// @vitest-environment jsdom
/* eslint-disable react/react-in-jsx-scope */

import { act, useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'
import {
  RailConnectionsProvider,
  useRailConnections,
  type RailConnection,
} from './railConnectionsContext'

vi.mock('../../ServerConfigContext', () => ({ useSiteName: () => 'Lisbeyond OS' }))
vi.mock('../SiteLogo', () => ({
  default: ({ srcOverride, children }: { srcOverride?: string, children: React.ReactNode }) =>
    srcOverride ? <img src={srcOverride} alt="" /> : children,
}))
vi.mock('./commandPaletteBus', () => ({ openCommandPalette: vi.fn<() => void>() }))
vi.mock('./SidebarWorkspaces', () => ({
  SidebarWorkspacesProvider: ({ children }: { children: React.ReactNode }) => children,
  SidebarWorkspacesTools: () => null,
  SidebarWorkspacesLists: () => null,
}))
vi.mock('./SidebarUtilityStrip', () => ({ default: () => null }))

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const ROUTES = [
  '/',
  '/properties',
  '/portfolio',
  '/sales/new-leads',
  '/ask-bifana',
  '/workflows',
  '/connections',
] as const

let container: HTMLDivElement | undefined
let root: Root | undefined

beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

function ConnectionsReporter({ rows }: { rows: RailConnection[] }) {
  const { reportConnections } = useRailConnections()
  useEffect(() => reportConnections(rows), [reportConnections, rows])
  return null
}

async function renderSidebar({
  collapsed = false,
  rows,
}: {
  collapsed?: boolean
  rows?: RailConnection[]
} = {}) {
  const rootRoute = createRootRoute({
    component: () => (
      <RailConnectionsProvider>
        {rows && <ConnectionsReporter rows={rows} />}
        <Sidebar collapsed={collapsed} onToggleCollapsed={() => {}} />
      </RailConnectionsProvider>
    ),
  })
  const childRoutes = ROUTES.map((path) => createRoute({
    getParentRoute: () => rootRoute,
    path,
  }))
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: ['/'] }),
    routeTree: rootRoute.addChildren(childRoutes),
  })
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root!.render(<RouterProvider router={router} />))
  return container
}

afterEach(async () => {
  await act(async () => root?.unmount())
  container?.remove()
  root = undefined
  container = undefined
  vi.restoreAllMocks()
})

describe('Console v3 sidebar', () => {
  it('marks expanded and collapsed rails for the responsive CSS contract', async () => {
    const expanded = await renderSidebar()
    expect(expanded.querySelector('aside[aria-label="Primary"]')?.getAttribute('data-collapsed'))
      .toBe('false')

    await act(async () => root?.unmount())
    container?.remove()
    root = undefined
    container = undefined

    const collapsed = await renderSidebar({ collapsed: true })
    expect(collapsed.querySelector('aside[aria-label="Primary"]')?.getAttribute('data-collapsed'))
      .toBe('true')
  })

  it('renders five primary items and moves Connections out of primary navigation', async () => {
    const view = await renderSidebar()
    const navLinks = [...view.querySelectorAll('nav a')]
    expect(navLinks).toHaveLength(5)
    expect(navLinks.map((link) => link.textContent)).toEqual([
      'Home',
      'Properties',
      'Portfolio',
      'Ask Bifana',
      'Workflows',
    ])
    expect(navLinks.some((link) => link.getAttribute('href') === '/connections')).toBe(false)
    expect(view.querySelector('a[href="/connections"]')?.textContent).toContain('All connections')
  })

  it('shows a three-row skeleton before the first connections report', async () => {
    const view = await renderSidebar()
    expect(view.querySelector('[aria-label="Loading connections"]')?.children).toHaveLength(3)
  })

  it('renders at most six reported rows with problems first', async () => {
    const rows: RailConnection[] = [
      { id: 'hostaway', name: 'Hostaway', state: 'live', detail: 'Live' },
      { id: 'notion', name: 'Notion', state: 'off', detail: 'Not connected' },
      { id: 'salesforce', name: 'Salesforce', state: 'partial', detail: 'Needs access' },
      { id: 'slack', name: 'Slack', state: 'live', detail: 'Live' },
      { id: 'drive', name: 'Drive', state: 'live', detail: 'Live' },
      { id: 'mews', name: 'Mews', state: 'live', detail: 'Live' },
      { id: 'infraspeak', name: 'Infraspeak', state: 'live', detail: 'Live' },
    ]
    const view = await renderSidebar({ rows })
    const sectionText = view.querySelector('section[aria-label="Connections"]')?.textContent ?? ''
    expect(sectionText.indexOf('Notion')).toBeLessThan(sectionText.indexOf('Salesforce'))
    expect(sectionText.indexOf('Salesforce')).toBeLessThan(sectionText.indexOf('Hostaway'))
    expect(sectionText).not.toContain('Infraspeak')
  })

  it('names an empty terminal report instead of leaving a blank connection section', async () => {
    const view = await renderSidebar({ rows: [] })
    expect(view.querySelector('section[aria-label="Connections"]')?.textContent)
      .toContain('Connection status unavailable')
  })

  it('renders only titled status dots when collapsed', async () => {
    const view = await renderSidebar({
      collapsed: true,
      rows: [{ id: 'hostaway', name: 'Hostaway', state: 'live', detail: 'Live' }],
    })
    const section = view.querySelector('section[aria-label="Connections"]')
    expect(section?.textContent).not.toContain('Hostaway')
    expect(section?.querySelector('[title="Hostaway: Live"]')).not.toBeNull()
  })
})

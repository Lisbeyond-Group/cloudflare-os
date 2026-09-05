// @vitest-environment jsdom
/* eslint-disable react/react-in-jsx-scope */

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { GadgetMetadataWithTimestamps } from '@gadgets/workshop-shared/api'

const testState = vi.hoisted(() => ({
  gadgets: [] as GadgetMetadataWithTimestamps[],
  listGadgets: vi.fn<() => Promise<GadgetMetadataWithTimestamps[]>>(),
  openGadget: vi.fn<(id: string) => never>(),
  whoami: vi.fn<() => Promise<{ id: string, name: string }>>(
    async () => ({ id: 'user-a', name: 'User A' }),
  ),
}))

const authenticatedApi = {
  listGadgets: testState.listGadgets,
  openGadget: testState.openGadget,
  whoami: testState.whoami,
}

vi.mock('../../AuthContext', () => ({
  useAuthenticatedApi: () => ({
    authenticatedApi,
  }),
}))

vi.mock('@cloudflare/kumo', () => ({
  useKumoToastManager: () => ({ add: vi.fn<(toast: unknown) => void>() }),
}))

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: {
    to: string
    children: React.ReactNode
    className?: string
  }) => <a href={to} className={className}>{children}</a>,
}))

vi.mock('./SidebarGadgetRow', () => ({
  default: ({ gadget: chat }: { gadget: GadgetMetadataWithTimestamps }) => (
    <div data-chat-row data-pinned={chat.pinned ? 'true' : 'false'}>{chat.title}</div>
  ),
}))

vi.mock('./RailConnections', () => ({
  RailLabel: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

vi.mock('../../ShareModal', () => ({ default: () => null }))
vi.mock('../DeleteConfirmationDialog', () => ({ default: () => null }))

import {
  SidebarWorkspacesLists,
  SidebarWorkspacesProvider,
} from './SidebarWorkspaces'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

function gadget(id: string, pinned = false, minutesAgo = 0): GadgetMetadataWithTimestamps {
  const date = new Date(Date.UTC(2026, 8, 5, 12, 0) - minutesAgo * 60_000)
  return {
    id,
    title: id,
    pinned,
    created: date,
    lastActive: date,
    totalCost: 0,
  } as GadgetMetadataWithTimestamps
}

async function renderLists() {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => {
    root.render(
      <SidebarWorkspacesProvider>
        <SidebarWorkspacesLists />
      </SidebarWorkspacesProvider>,
    )
    await Promise.resolve()
    await Promise.resolve()
  })
  return container
}

beforeEach(() => {
  testState.listGadgets.mockImplementation(async () => testState.gadgets)
})

afterEach(async () => {
  await act(async () => root?.unmount())
  container?.remove()
  vi.clearAllMocks()
  testState.gadgets = []
})

describe('sidebar chat groups', () => {
  it('hides empty Saved and limits Recent while retaining full-history access', async () => {
    testState.gadgets = Array.from({ length: 8 }, (_, index) => gadget(`recent-${index}`, false, index))
    const view = await renderLists()

    expect(view.textContent).not.toContain('Saved chats')
    expect(view.querySelectorAll('[data-chat-row]')).toHaveLength(4)
    expect([...view.querySelectorAll('[data-chat-row]')].map(row => row.textContent)).toEqual([
      'recent-0',
      'recent-1',
      'recent-2',
      'recent-3',
    ])
    expect(view.querySelector<HTMLAnchorElement>('a[href="/workspaces"]')?.textContent)
      .toContain('Show all (8)')
  })

  it('keeps every saved chat visible and separate from Recent without mutating state', async () => {
    testState.gadgets = [
      gadget('saved-newer', true, 0),
      gadget('recent-newer', false, 1),
      gadget('saved-older', true, 2),
      ...Array.from({ length: 5 }, (_, index) => gadget(`recent-${index}`, false, index + 3)),
    ]
    const view = await renderLists()
    const saved = [...view.querySelectorAll('[data-chat-row][data-pinned="true"]')]
    const recent = [...view.querySelectorAll('[data-chat-row][data-pinned="false"]')]

    expect(view.textContent).toContain('Saved chats2')
    expect(saved.map(row => row.textContent)).toEqual(['saved-newer', 'saved-older'])
    expect(recent.map(row => row.textContent)).toEqual([
      'recent-newer',
      'recent-0',
      'recent-1',
      'recent-2',
    ])
    expect(testState.openGadget).not.toHaveBeenCalled()
  })
})

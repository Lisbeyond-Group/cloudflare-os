import { useCallback, useEffect, useState } from 'react'

export const DESKTOP_WORKSPACE_BREAKPOINT = 1024
export const MIN_CHAT_WIDTH = 480
export const MIN_WORKSPACE_WIDTH = 480
export const MAX_CHAT_WIDTH = 720

export type WorkspaceLayoutView = 'chat' | 'app' | 'activity' | null

export function resolveWorkspaceLayout({
  ready,
  hasArtifacts,
  view,
}: {
  ready: boolean
  hasArtifacts: boolean
  view: WorkspaceLayoutView
}) {
  const showFullEditor = ready && (view === 'activity' || (hasArtifacts && view === 'app'))
  return {
    showFullEditor,
    showOutputRail: ready && hasArtifacts && !showFullEditor,
  }
}

export function isCompactWorkspaceViewport(viewportWidth: number) {
  return viewportWidth < DESKTOP_WORKSPACE_BREAKPOINT
}

export function clampWorkspaceChatWidth(width: number, viewportWidth: number) {
  const availableMaximum = Math.max(MIN_CHAT_WIDTH, viewportWidth - MIN_WORKSPACE_WIDTH - 1)
  const maximum = Math.min(MAX_CHAT_WIDTH, availableMaximum)
  return Math.max(MIN_CHAT_WIDTH, Math.min(maximum, width))
}

export function defaultWorkspaceChatWidth(viewportWidth: number) {
  return clampWorkspaceChatWidth(Math.floor(viewportWidth * 0.44), viewportWidth)
}

export function workspaceChatWidthFromPointer(
  pointerClientX: number,
  workspaceLeft: number,
  workspaceWidth: number,
) {
  return clampWorkspaceChatWidth(pointerClientX - workspaceLeft, workspaceWidth)
}

export function useWorkspaceBodyWidth(initialWidth: number) {
  const [body, setBody] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(initialWidth)
  const bodyRef = useCallback((node: HTMLDivElement | null) => setBody(node), [])

  useEffect(() => {
    if (!body) return
    const update = (nextWidth: number) => setWidth(nextWidth)
    update(body.getBoundingClientRect().width)
    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) update(entry.contentRect.width)
    })
    observer.observe(body)
    return () => observer.disconnect()
  }, [body])

  return { body, bodyRef, width }
}

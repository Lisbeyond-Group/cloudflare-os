import { describe, expect, it } from 'vitest'
import {
  clampWorkspaceChatWidth,
  defaultWorkspaceChatWidth,
  isCompactWorkspaceViewport,
  resolveWorkspaceLayout,
  workspaceChatWidthFromPointer,
} from './workspaceLayout'

describe('workspace layout policy', () => {
  it('keeps existing artifacts discoverable without forcing the editor open', () => {
    expect(resolveWorkspaceLayout({ ready: true, hasArtifacts: true, view: null })).toEqual({
      showFullEditor: false,
      showOutputRail: true,
    })
    expect(resolveWorkspaceLayout({ ready: true, hasArtifacts: true, view: 'chat' })).toEqual({
      showFullEditor: false,
      showOutputRail: true,
    })
  })

  it('opens the full pane for a deliberate artifact or activity view', () => {
    expect(resolveWorkspaceLayout({ ready: true, hasArtifacts: true, view: 'app' })).toEqual({
      showFullEditor: true,
      showOutputRail: false,
    })
    expect(resolveWorkspaceLayout({ ready: true, hasArtifacts: false, view: 'activity' })).toEqual({
      showFullEditor: true,
      showOutputRail: false,
    })
  })

  it('waits for initial state before exposing either artifact surface', () => {
    expect(resolveWorkspaceLayout({ ready: false, hasArtifacts: true, view: 'app' })).toEqual({
      showFullEditor: false,
      showOutputRail: false,
    })
  })

  it('uses one pane below desktop and readable split widths above it', () => {
    expect(isCompactWorkspaceViewport(390)).toBe(true)
    expect(isCompactWorkspaceViewport(1023)).toBe(true)
    expect(isCompactWorkspaceViewport(1024)).toBe(false)
    expect(clampWorkspaceChatWidth(420, 1440)).toBe(480)
    expect(defaultWorkspaceChatWidth(1440)).toBe(633)
    expect(defaultWorkspaceChatWidth(2200)).toBe(720)
    expect(clampWorkspaceChatWidth(900, 1024)).toBe(543)
  })

  it('measures drag positions from the workspace canvas rather than the viewport', () => {
    expect(workspaceChatWidthFromPointer(760, 80, 1440)).toBe(680)
    expect(workspaceChatWidthFromPointer(2000, 80, 1024)).toBe(543)
  })
})

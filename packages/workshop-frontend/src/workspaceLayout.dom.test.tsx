// @vitest-environment jsdom
/* eslint-disable react/react-in-jsx-scope */

import { act, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useWorkspaceBodyWidth } from './workspaceLayout'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let resizeCallback: ResizeObserverCallback | undefined
class TestResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback
  }
  observe = vi.fn<(target: Element) => void>()
  disconnect = vi.fn<() => void>()
  unobserve = vi.fn<(target: Element) => void>()
}
vi.stubGlobal('ResizeObserver', TestResizeObserver)

function Harness() {
  const [loaded, setLoaded] = useState(false)
  const { bodyRef, width } = useWorkspaceBodyWidth(1440)
  return (
    <>
      <output>{width}</output>
      <button onClick={() => setLoaded(true)}>Load</button>
      {loaded && <div ref={bodyRef} data-workspace-body />}
    </>
  )
}

let container: HTMLDivElement
let root: Root

afterEach(async () => {
  await act(async () => root?.unmount())
  container?.remove()
  resizeCallback = undefined
})

describe('workspace body observation', () => {
  it('attaches after the loading view is replaced and follows its rendered width', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 900,
      height: 600,
      x: 80,
      y: 0,
      left: 80,
      top: 0,
      right: 980,
      bottom: 600,
      toJSON: () => ({}),
    })
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    await act(async () => root.render(<Harness />))
    expect(container.querySelector('output')?.textContent).toBe('1440')

    await act(async () => {
      container.querySelector('button')?.click()
    })
    expect(container.querySelector('output')?.textContent).toBe('900')

    // The observer callback proves subsequent container-only resizes are delivered.
    await act(async () => {
      resizeCallback?.([{ contentRect: { width: 700 } } as ResizeObserverEntry], {} as ResizeObserver)
    })
    expect(container.querySelector('output')?.textContent).toBe('700')
  })
})

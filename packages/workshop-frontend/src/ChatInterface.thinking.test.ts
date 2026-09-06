// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getStoredShowThinkingTraces } from './ChatInterface'

const stored = new Map<string, string>()
const localStorageStub = {
  clear: () => stored.clear(),
  getItem: (key: string) => stored.get(key) ?? null,
  removeItem: (key: string) => stored.delete(key),
  setItem: (key: string, value: string) => stored.set(key, value),
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', { configurable: true, value: localStorageStub })
})

afterEach(() => localStorageStub.clear())

describe('thinking trace preference', () => {
  it('hides typed reasoning by default and only shows it after an explicit choice', () => {
    expect(getStoredShowThinkingTraces()).toBe(false)
    localStorageStub.setItem('showThinkingTraces', 'true')
    expect(getStoredShowThinkingTraces()).toBe(true)
  })
})

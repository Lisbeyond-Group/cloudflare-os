import { describe, expect, it } from 'vitest'
import { isTransientConnectionError } from './GatekeeperAppPage'

describe('isTransientConnectionError', () => {
  it.each([
    new Error('Peer closed WebSocket: 1006'),
    'WebSocket closed unexpectedly (1006)',
    'Secure connection was closed',
  ])('recognizes a retryable connection closure', (error) => {
    expect(isTransientConnectionError(error)).toBe(true)
  })

  it('keeps configuration errors non-retryable', () => {
    expect(isTransientConnectionError(new Error('Gatekeeper app is not configured'))).toBe(false)
  })
})

// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import {
  EMPLOYEE_CONVERSATION_SEARCH,
  employeeConversationSearch,
  employeeConversationWorkspaceSearch,
  genericWorkpieceWorkspaceSearch,
} from './employeeConversationRoute'

describe('employee conversation route presentation', () => {
  it('uses an explicit marker without inferring a workspace presentation', () => {
    expect(employeeConversationSearch({})).toBe(false)
    expect(employeeConversationSearch({ employeeConversation: true })).toBe(true)
    expect(employeeConversationSearch({ employeeConversation: 'true' })).toBe(true)
    expect(employeeConversationSearch({ employeeConversation: 'false' })).toBe(false)
  })

  it('retains only safe workspace context after consuming a share key', () => {
    expect(employeeConversationWorkspaceSearch({
      chat: 8,
      w: 3,
      ...EMPLOYEE_CONVERSATION_SEARCH,
      shareKey: 'one-time-secret',
      other: 'incidental',
    })).toEqual({
      chat: 8,
      w: 3,
      ...EMPLOYEE_CONVERSATION_SEARCH,
    })

    expect(employeeConversationWorkspaceSearch({ shareKey: 'one-time-secret' })).toEqual({})
  })

  it('opens an artifact in the generic editor while keeping its chat context', () => {
    expect(genericWorkpieceWorkspaceSearch({
      chat: 8,
      w: 3,
      ...EMPLOYEE_CONVERSATION_SEARCH,
      other: 'incidental',
    }, 12, undefined)).toEqual({ chat: 8, w: 12 })

    expect(genericWorkpieceWorkspaceSearch({ chat: 8 }, 12, 24)).toEqual({ chat: 24, w: 12 })
  })
})

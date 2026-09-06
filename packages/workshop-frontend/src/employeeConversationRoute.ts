export const EMPLOYEE_CONVERSATION_SEARCH = { employeeConversation: true } as const

export function employeeConversationSearch(search: Record<string, unknown>): boolean {
  return search.employeeConversation === true || search.employeeConversation === 'true'
}

export function employeeConversationWorkspaceSearch(search: Record<string, unknown>) {
  const chat = typeof search.chat === 'number' ? search.chat : undefined
  const workpiece = typeof search.w === 'number' ? search.w : undefined
  return {
    ...(chat === undefined ? {} : { chat }),
    ...(workpiece === undefined ? {} : { w: workpiece }),
    ...(employeeConversationSearch(search) ? EMPLOYEE_CONVERSATION_SEARCH : {}),
  }
}

export function genericWorkpieceWorkspaceSearch(
  search: Record<string, unknown>,
  workpieceId: number,
  pendingChatId: number | undefined,
) {
  return {
    chat: pendingChatId ?? (typeof search.chat === 'number' ? search.chat : undefined),
    w: workpieceId,
  }
}

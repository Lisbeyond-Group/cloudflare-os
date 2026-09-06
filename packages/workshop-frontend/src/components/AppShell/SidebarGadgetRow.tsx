import { Link } from '@tanstack/react-router'
import { ChatCircle, DotsThree, Star, ShareNetwork, Trash, Pencil } from '@phosphor-icons/react'
import { DropdownMenu } from '@cloudflare/kumo'
import { MENU_CONTENT, MENU_ITEM, MENU_ITEM_DANGER, MENU_POSITIONER_STYLE } from '../menuStyles'
import { useState, useEffect, useRef } from 'react'
import type { GadgetMetadataWithTimestamps } from '@gadgets/workshop-shared/api'
import { EMPLOYEE_CONVERSATION_SEARCH } from '../../employeeConversationRoute'

function conversationTitle(title: string | undefined): string {
  const trimmed = title?.trim()
  if (!trimmed || trimmed.toLowerCase() === 'untitled workspace') return 'Untitled chat'
  return trimmed
}

/**
 * One row in the sidebar's Favorites / Recent list. Compact, with a chat icon, a truncated
 * title, and an overflow menu (favorite, rename, share, delete). Favorite/rename/share/delete
 * callbacks are passed in by the parent so this row stays a pure presentational component.
 */
export default function SidebarGadgetRow({
  gadget,
  collapsed = false,
  onTogglePin,
  onRename,
  onShare,
  onDelete,
}: {
  gadget: GadgetMetadataWithTimestamps
  collapsed?: boolean
  onTogglePin: (g: GadgetMetadataWithTimestamps) => void
  onRename: (g: GadgetMetadataWithTimestamps, newTitle: string) => void
  onShare: (g: GadgetMetadataWithTimestamps) => void
  onDelete: (g: GadgetMetadataWithTimestamps) => void
}) {
  const displayTitle = conversationTitle(gadget.title)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(gadget.title || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  const commit = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== gadget.title) onRename(gadget, trimmed)
    setRenaming(false)
  }

  const startRename = () => {
    setRenameValue(gadget.title || '')
    setRenaming(true)
  }

  return (
    <Link
      to="/workspace/$id"
      params={{ id: gadget.id }}
      search={EMPLOYEE_CONVERSATION_SEARCH}
      className={[
        'group flex h-10 items-center rounded-lg text-[13px] leading-[18px] tracking-[-0.25px] text-lb-rail-ink-2 transition-colors hover:bg-lb-rail-active hover:text-lb-rail-ink max-md:h-11',
        collapsed ? 'w-10 justify-center max-md:w-11' : 'gap-2 pl-1.5 pr-1',
      ].join(' ')}
      activeProps={{
        className: [
          'flex h-10 items-center rounded-lg bg-lb-rail-active text-[13px] font-medium leading-[18px] tracking-[-0.25px] text-lb-rail-ink max-md:h-11',
          collapsed ? 'w-10 justify-center max-md:w-11' : 'gap-2 pl-1.5 pr-1',
        ].join(' '),
      }}
      onClick={(e) => {
        if (renaming) e.preventDefault()
      }}
      title={collapsed ? displayTitle : undefined}
    >
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center text-lb-rail-muted"
        aria-hidden="true"
      >
        <ChatCircle size={14} weight="regular" />
      </span>

      {!collapsed && (
        <>
          {renaming ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') setRenaming(false)
              }}
              className="min-w-0 flex-1 border-b border-lb-rail-label bg-transparent text-[13px] leading-[18px] tracking-[-0.25px] text-lb-rail-ink outline-none"
              onClick={(e) => e.preventDefault()}
            />
          ) : (
            <span className="min-w-0 flex-1 truncate">{displayTitle}</span>
          )}

          {/* Inside the row's <Link>: stopPropagation blocks the Link's SPA handler, so preventDefault
              is needed to stop the native <a> from navigating. */}
          <div onClick={(e) => { e.stopPropagation(); e.preventDefault() }}>
            <DropdownMenu>
              <DropdownMenu.Trigger
                render={
                  <button
                    type="button"
                    aria-label="Chat actions"
                    className="flex h-10 w-10 items-center justify-center rounded-md text-lb-rail-muted opacity-0 transition-[opacity,color,background-color] group-hover:opacity-100 hover:bg-lb-rail-active hover:text-lb-rail-ink focus:opacity-100 max-md:h-11 max-md:w-11"
                  >
                    <DotsThree size={14} weight="bold" />
                  </button>
                }
              />
              <DropdownMenu.Content className={MENU_CONTENT} style={MENU_POSITIONER_STYLE}>
                <DropdownMenu.Item
                  onClick={startRename}
                  className={MENU_ITEM}
                >
                  <Pencil size={13} className="mr-2" /> Rename
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onTogglePin(gadget)}
                  className={MENU_ITEM}
                >
                  <Star size={13} className="mr-2" weight={gadget.pinned ? 'fill' : 'regular'} />
                  {gadget.pinned ? 'Unfavorite' : 'Favorite'}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => onShare(gadget)}
                  className={MENU_ITEM}
                >
                  <ShareNetwork size={13} className="mr-2" /> Share
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  variant="danger"
                  onClick={() => onDelete(gadget)}
                  className={MENU_ITEM_DANGER}
                >
                  <Trash size={13} className="mr-2" />
                  {gadget.owner ? 'Dismiss' : 'Delete'}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </>
      )}

      {/* Collapsed rows show only the icon (aria-hidden), so name the link for screen readers. */}
      {collapsed && <span className="sr-only">{displayTitle}</span>}
    </Link>
  )
}

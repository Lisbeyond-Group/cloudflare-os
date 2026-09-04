import { useNavigate } from '@tanstack/react-router'
import { DropdownMenu } from '@cloudflare/kumo'
import { useAuthenticatedApi } from '../AuthContext'
import { useAvatar } from '../useAvatar'
import { MENU_CONTENT, MENU_ITEM, MENU_ITEM_DANGER, MENU_POSITIONER_STYLE } from './menuStyles'

export default function UserMenu({ showIdentity = false }: { showIdentity?: boolean }) {
  const { authenticatedApi, logout, currentUser, isAdmin } = useAuthenticatedApi()
  const navigate = useNavigate()

  const avatarUrl = useAvatar(authenticatedApi, currentUser?.id)
  const displayName = currentUser?.name?.trim() || 'Account'

  const initials = displayName !== 'Account'
    ? displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        render={
          <button
            className={[
              'flex h-10 min-w-0 cursor-pointer items-center bg-kumo-elevated text-kumo-default',
              'transition-colors hover:bg-kumo-tint focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-kumo-ring focus-visible:ring-offset-2 focus-visible:ring-offset-kumo-elevated',
              showIdentity ? 'w-full gap-2 rounded-lg px-1.5 text-left' : 'w-10 justify-center rounded-full',
            ].join(' ')}
            title={`Open profile menu for ${displayName}`}
            aria-label={`Open profile menu for ${displayName}`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-kumo-tint">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-medium text-kumo-strong">{initials}</span>
              )}
            </span>
            {showIdentity && (
              <span className="min-w-0 truncate text-[13px] font-medium">{displayName}</span>
            )}
          </button>
        }
      />
      <DropdownMenu.Content className={MENU_CONTENT} style={MENU_POSITIONER_STYLE}>
        <DropdownMenu.Item
          onClick={() => navigate({ to: '/profile' })}
          className={MENU_ITEM}
        >
          Profile
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => navigate({ to: '/providers' })}
          className={MENU_ITEM}
        >
          Providers
        </DropdownMenu.Item>
        {isAdmin && (
          <DropdownMenu.Item
            onClick={() => navigate({ to: '/admin' })}
            className={MENU_ITEM}
          >
            Admin
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          variant="danger"
          onClick={logout}
          className={MENU_ITEM_DANGER}
        >
          Sign out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

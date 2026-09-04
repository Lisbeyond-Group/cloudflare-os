import { Link } from '@tanstack/react-router'
import {
  Buildings,
  ChartPieSlice,
  ChatCircleDots,
  Hexagon,
  House,
  Lightning,
  MagnifyingGlass,
  SidebarSimple,
  UsersThree,
} from '@phosphor-icons/react'
import { useSiteName } from '../../ServerConfigContext'
import SiteLogo from '../SiteLogo'
import { openCommandPalette } from './commandPaletteBus'
import SidebarItem from './SidebarItem'
import {
  SidebarWorkspacesProvider,
  SidebarWorkspacesTools,
  SidebarWorkspacesLists,
} from './SidebarWorkspaces'
import SidebarUtilityStrip from './SidebarUtilityStrip'
import RailConnections from './RailConnections'

/**
 * The persistent left rail. Three pinned regions sandwich a single scrolling region of lists, so
 * the user can always reach Search, primary nav, and the bottom utility strip no matter how many
 * workspaces they have.
 *
 * Layout (top → bottom):
 *   • brand row                            pinned
 *   • primary Lisbeyond navigation         pinned
 *   • workspace tools (⌘K search)          pinned
 *   • Favorites / Recent workspaces        SCROLLS
 *   • connection status                    pinned
 *   • utility strip (theme, settings, avatar) pinned
 */
export default function Sidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const siteName = useSiteName()
  return (
    <aside
      aria-label="Primary"
      className={[
        'flex h-screen flex-col bg-lb-rail text-lb-rail-ink-2',
        collapsed ? 'w-[56px]' : 'w-[232px]',
        'shrink-0 transition-[width] duration-200 ease-out',
      ].join(' ')}
    >
      {/* Brand row */}
      <div
        className={[
          'flex shrink-0',
          collapsed
            ? 'h-14 items-center justify-center px-1.5'
            : 'h-[100px] items-start justify-between gap-2 px-2 pt-[26px]',
        ].join(' ')}
      >
        {collapsed ? (
          <Link to="/" aria-label={siteName} className="flex h-10 w-10 items-center justify-center">
            <span className="relative block h-7 w-7 overflow-hidden">
              <SiteLogo
                size={68}
                srcOverride="/brand/lisbeyond-lockup-beige.svg"
                className="absolute left-1/2 top-0 h-auto w-[68px] max-w-none -translate-x-1/2"
              >
                <Hexagon size={28} weight="bold" className="shrink-0 text-lb-rail-ink" />
              </SiteLogo>
            </span>
          </Link>
        ) : (
          <Link to="/" aria-label={siteName} className="flex min-w-0 items-start">
            <SiteLogo
              size={112}
              srcOverride="/brand/lisbeyond-lockup-beige.svg"
              className="h-auto w-[112px] shrink-0"
            >
              <Hexagon size={24} weight="bold" className="shrink-0 text-lb-rail-ink" />
            </SiteLogo>
          </Link>
        )}
        {!collapsed && (
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => openCommandPalette()}
              aria-label="Search"
              title="Search (⌘K)"
              className="press flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-lb-rail-muted transition-colors hover:bg-lb-rail-active hover:text-lb-rail-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-rail-label max-md:h-11 max-md:w-11"
            >
              <MagnifyingGlass size={15} />
            </button>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-lb-rail-muted transition-colors hover:bg-lb-rail-active hover:text-lb-rail-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-rail-label max-md:h-11 max-md:w-11"
            >
              <SidebarSimple size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Expand affordance when collapsed — placed just under the logo for discoverability. */}
      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mx-auto mt-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lb-rail-muted transition-colors hover:bg-lb-rail-active hover:text-lb-rail-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-rail-label"
        >
          <SidebarSimple size={15} className="rotate-180" />
        </button>
      )}

      <SidebarWorkspacesProvider>
        {/* Pinned top stack. shrink-0 keeps it from squishing when the lists below grow. */}
        <div className="flex shrink-0 flex-col gap-3 pt-3">
          {/* Primary nav */}
          <nav className="flex flex-col gap-0.5 px-2">
            <SidebarItem
              to="/"
              label="Home"
              icon={<House size={14} weight="regular" />}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/properties"
              label="Properties"
              icon={<Buildings size={14} weight="regular" />}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/portfolio"
              label="Portfolio"
              icon={<ChartPieSlice size={14} weight="regular" />}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/sales/new-leads"
              label="Sales"
              icon={<UsersThree size={14} weight="regular" />}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/ask-bifana"
              label="Ask Bifana"
              icon={<ChatCircleDots size={14} weight="regular" />}
              collapsed={collapsed}
            />
            <SidebarItem
              to="/workflows"
              label="Workflows"
              icon={<Lightning size={14} weight="regular" />}
              collapsed={collapsed}
            />
          </nav>

          {/* Workspace tools: search. Pinned so it's always reachable. */}
          <SidebarWorkspacesTools collapsed={collapsed} />
        </div>

        {/* Scrolling middle: only the Favorites / Recent workspaces / Recent blueprints lists.
            min-h-0 lets flex children compute scroll height correctly. */}
        <div className="sidebar-scroll mt-1 min-h-0 flex-1 overflow-y-auto">
          <SidebarWorkspacesLists collapsed={collapsed} />
        </div>
      </SidebarWorkspacesProvider>

      <RailConnections collapsed={collapsed} />
      <SidebarUtilityStrip collapsed={collapsed} />
    </aside>
  )
}

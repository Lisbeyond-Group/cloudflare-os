import { Link } from '@tanstack/react-router'
import { Desktop, GearSix, Moon, Sun } from '@phosphor-icons/react'
import { Tooltip } from '@cloudflare/kumo'
import UserMenu from '../UserMenu'
import { useTheme } from '../../ThemeContext'
import type { ThemeMode } from '../../theme'

const THEME_SEQUENCE: ThemeMode[] = ['system', 'light', 'dark']

function nextThemeMode(mode: ThemeMode): ThemeMode {
  return THEME_SEQUENCE[(THEME_SEQUENCE.indexOf(mode) + 1) % THEME_SEQUENCE.length]
}

function ThemeModeButton() {
  const { themeMode, resolvedThemeMode, setThemeMode } = useTheme()
  const label = themeMode === 'system'
    ? `Theme: system (${resolvedThemeMode})`
    : `Theme: ${themeMode}`
  const nextMode = nextThemeMode(themeMode)

  return (
    <Tooltip
      content={`${label}. Switch to ${nextMode}.`}
      render={(
        <button
          type="button"
          aria-label={`${label}. Switch to ${nextMode}.`}
          onClick={() => setThemeMode(nextMode)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-lb-rail-muted transition-colors hover:bg-lb-rail-active hover:text-lb-rail-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-rail-label max-md:h-11 max-md:w-11"
        >
          {themeMode === 'system' ? (
            <Desktop size={15} />
          ) : themeMode === 'dark' ? (
            <Moon size={15} />
          ) : (
            <Sun size={15} />
          )}
        </button>
      )}
    />
  )
}

function SettingsButton() {
  return (
    <Tooltip
      content="Settings"
      render={(
        <Link
          to="/settings"
          aria-label="Settings"
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lb-rail-muted transition-[background-color,color] hover:bg-lb-rail-active hover:text-lb-rail-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lb-rail-label max-md:h-11 max-md:w-11"
        >
          <GearSix size={15} />
        </Link>
      )}
    />
  )
}

export default function SidebarUtilityStrip({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={[
        // shrink-0 + solid base so the strip is visually pinned above the scrolling rail body
        // and content can't bleed through it. Flat treatment — no top shadow.
        'flex shrink-0 border-t border-lb-rail-line bg-lb-rail py-2',
        collapsed ? 'flex-col items-center gap-2 px-1.5' : 'items-center gap-1 px-2',
      ].join(' ')}
    >
      {!collapsed && (
        <span className="min-w-0 flex-1 truncate px-1.5 text-[12px] font-medium text-lb-rail-muted">
          Lisbeyond OS
        </span>
      )}
      <ThemeModeButton />
      <SettingsButton />
      <div className="[&_button]:!bg-lb-rail [&_button]:!text-lb-rail-ink-2 [&_button:hover]:!bg-lb-rail-active [&_button:hover]:!text-lb-rail-ink [&_button:focus-visible]:!ring-lb-rail-label [&_button:focus-visible]:!ring-offset-lb-rail [&_button>span:first-child]:!h-7 [&_button>span:first-child]:!w-7 [&_button>span:first-child]:!bg-lb-accent [&_button>span:first-child_span]:!text-lb-rail-ink [&_button]:max-md:!h-11 [&_button]:max-md:!w-11">
        <UserMenu />
      </div>
    </div>
  )
}

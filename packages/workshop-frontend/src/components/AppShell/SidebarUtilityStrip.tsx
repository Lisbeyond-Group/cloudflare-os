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
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-kumo-inactive transition-colors hover:bg-kumo-tint hover:text-kumo-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kumo-ring focus-visible:ring-offset-2 focus-visible:ring-offset-kumo-elevated"
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

export default function SidebarUtilityStrip({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div
      className={[
        // shrink-0 + solid base so the strip is visually pinned above the scrolling rail body
        // and content can't bleed through it. Flat treatment — no top shadow.
        'shrink-0 flex flex-col gap-1 border-t border-kumo-line bg-kumo-elevated px-2 py-2',
        collapsed ? 'items-center gap-2 px-1.5' : '',
      ].join(' ')}
    >
      <Link
        to="/settings"
        aria-label="Settings"
        title="Settings"
        className={[
          'press flex h-10 items-center rounded-lg text-[13px] font-medium text-kumo-subtle xl:h-11 xl:text-[14px] 2xl:h-12 2xl:text-[15px]',
          'transition-[background-color,color] hover:bg-kumo-tint hover:text-kumo-default',
          collapsed ? 'w-10 justify-center' : 'w-full gap-2 px-2',
        ].join(' ')}
      >
        <GearSix size={16} />
        {!collapsed && <span>Settings</span>}
      </Link>
      <div className={collapsed
        ? 'flex flex-col items-center gap-2'
        : 'flex w-full items-center justify-end gap-1'}>
        <ThemeModeButton />
        <UserMenu />
      </div>
    </div>
  )
}

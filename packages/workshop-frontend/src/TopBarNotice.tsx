import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useServerConfig } from './ServerConfigContext'

/**
 * Centered text in the top bar. Shows the deployment's admin-configured notice (rendered as inline
 * Markdown, so it can include links) when one is set; renders nothing when it's empty.
 *
 * Designed to be placed inside a flex container that has `position: relative`; it absolutely-centers
 * itself so it doesn't affect the left/right layout. Hidden below the `lg` breakpoint where it would
 * crowd the bar.
 * `inline` instead participates in normal flow, including on mobile, for the app shell's optional
 * announcement row. An empty notice never reserves space.
 */

// Render the notice as a single inline run: paragraphs collapse to plain inline content and links
// become clickable anchors. Other block elements also render inline-ish, which is fine for a short
// one-line notice.
const INLINE_MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <>{children}</>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-kumo-brand hover:underline pointer-events-auto"
    >
      {children}
    </a>
  ),
}

export default function TopBarNotice({ inline = false }: { inline?: boolean }) {
  const notice = (useServerConfig()?.announcement ?? '').trim()

  if (!notice) return null

  return (
    <div
      aria-hidden="false"
      className={inline
        ? 'min-w-0 flex-1 px-3 text-center'
        : 'hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none px-40'}
    >
      <div className={`${inline ? 'py-2 break-words' : 'truncate'} max-w-full text-[13px] leading-[18px] font-normal tracking-[-0.25px] text-kumo-subtle`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={INLINE_MARKDOWN_COMPONENTS}>
          {notice}
        </ReactMarkdown>
      </div>
    </div>
  )
}

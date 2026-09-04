// Vitest runs under Node, but this package's source tsconfig intentionally has browser-only types.
// @ts-expect-error node builtin without @types/node
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(new URL('../../styles.css', import.meta.url), 'utf8')

describe('Console v3 sidebar responsive contract', () => {
  it('scales the complete expanded rail at the two large-screen breakpoints', () => {
    expect(styles).toMatch(
      /@media \(min-width: 1800px\)[\s\S]*?data-collapsed='false'[\s\S]*?height:\s*calc\(100vh \/ 1\.1379310345\);[\s\S]*?zoom:\s*1\.1379310345/,
    )
    expect(styles).toMatch(
      /@media \(min-width: 2200px\)[\s\S]*?data-collapsed='false'[\s\S]*?height:\s*calc\(100vh \/ 1\.2413793103\);[\s\S]*?zoom:\s*1\.2413793103/,
    )
  })

  it('keeps scaling scoped to expanded rails', () => {
    expect(styles).not.toMatch(/data-collapsed='true'[^}]*zoom:/)
  })
})

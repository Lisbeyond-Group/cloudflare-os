// @vitest-environment jsdom
import { createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { expect, it } from 'vitest'
import { Route as salesRoute } from './routes/sales_.new-leads'

it('resolves old Sales links to Portfolio while retaining their search and fragment', async () => {
  const root = createRootRoute()
  const legacy = createRoute({
    getParentRoute: () => root,
    path: '/sales/new-leads',
    beforeLoad: salesRoute.options.beforeLoad,
  })
  const target = createRoute({ getParentRoute: () => root, path: '/portfolio/new-leads' })
  const router = createRouter({
    routeTree: root.addChildren([legacy, target]),
    history: createMemoryHistory({ initialEntries: ['/sales/new-leads?view=changes#latest'] }),
  })
  await router.load()
  expect(router.state.location.pathname).toBe('/portfolio/new-leads')
  expect(router.state.location.search).toEqual({ view: 'changes' })
  expect(router.state.location.hash).toBe('latest')
})

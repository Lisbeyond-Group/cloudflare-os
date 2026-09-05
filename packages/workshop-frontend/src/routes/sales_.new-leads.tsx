import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/sales_/new-leads')({
  beforeLoad: () => {
    throw redirect({ to: '/portfolio/new-leads', search: true, hash: true, replace: true })
  },
  component: () => null,
})

import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/portfolio_/revenue-management')({
  component: () => <LisbeyondRoutePage
    route="portfolio/revenue-management"
    title="Revenue Management"
  />,
})

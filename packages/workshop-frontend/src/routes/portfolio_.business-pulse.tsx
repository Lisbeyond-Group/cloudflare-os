import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/portfolio_/business-pulse')({
  component: () => <LisbeyondRoutePage
    route="portfolio/business-pulse"
    title="Weekly Business Pulse"
  />,
})

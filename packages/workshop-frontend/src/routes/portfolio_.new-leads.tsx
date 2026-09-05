import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/portfolio_/new-leads')({
  component: () => <LisbeyondRoutePage route="portfolio/new-leads" title="New Leads" />,
})

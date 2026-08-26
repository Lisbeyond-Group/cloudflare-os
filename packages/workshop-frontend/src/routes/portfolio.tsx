import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/portfolio')({
  component: () => <LisbeyondRoutePage route="portfolio" title="Portfolio" />,
})

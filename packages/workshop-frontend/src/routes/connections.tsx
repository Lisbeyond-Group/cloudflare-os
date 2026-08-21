import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/connections')({
  component: () => <LisbeyondRoutePage route="connections" title="Connections" />,
})

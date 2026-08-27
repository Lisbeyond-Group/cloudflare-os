import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/settings')({
  component: () => <LisbeyondRoutePage route="settings" title="Settings" />,
})

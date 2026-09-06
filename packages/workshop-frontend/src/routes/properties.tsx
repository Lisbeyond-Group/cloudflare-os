import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'
import { parsePropertyRouteState } from '../gatekeeperAppNavigation'

export const Route = createFileRoute('/properties')({
  validateSearch: parsePropertyRouteState,
  component: PropertiesPage,
})

function PropertiesPage() {
  return <LisbeyondRoutePage route="properties" title="Properties" />
}

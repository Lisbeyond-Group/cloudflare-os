import { createFileRoute } from '@tanstack/react-router'
import { parseWorkflowRouteState } from '../gatekeeperAppNavigation'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/workflows')({
  validateSearch: parseWorkflowRouteState,
  component: WorkflowsPage,
})

function WorkflowsPage() {
  return <LisbeyondRoutePage route="workflows" title="Workflows" />
}

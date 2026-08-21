import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/workflows')({
  component: WorkflowsPage,
})

function WorkflowsPage() {
  return <LisbeyondRoutePage route="workflows" title="Workflows" />
}

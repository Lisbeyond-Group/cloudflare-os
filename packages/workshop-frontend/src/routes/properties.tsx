import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/properties')({
  component: PropertiesPage,
})

function PropertiesPage() {
  return <LisbeyondRoutePage route="properties" title="Properties" />
}

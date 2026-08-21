import { createFileRoute } from '@tanstack/react-router'
import LisbeyondRoutePage from '../components/LisbeyondRoutePage'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return <LisbeyondRoutePage route="home" title="Home" />
}

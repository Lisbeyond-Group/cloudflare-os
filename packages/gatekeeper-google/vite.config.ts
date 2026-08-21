// Vite+ per-package settings. The build:configurator task definition is shared by all gatekeepers
// with a configurator UI and lives beside the builder it runs; `withTests` adds the shared `test`
// task for the pure-logic suite in `__tests__/`.
export { withTests as default } from '../../scripts/gatekeeper-configurator-vite-config.js'

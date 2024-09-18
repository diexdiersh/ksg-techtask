/* eslint-disable n/no-process-exit */

import Fastify from 'fastify'

// Import graceful shutdown setup
import App from './app.js'
import {setupGracefulShutdown} from './shared/utils/index.js'
import {DEFAULT} from './shared/constants/defaults.constants.js'

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
})

// Register your application as a normal plugin.
app.register(App)

// Set up graceful shutdown with a configurable delay (in milliseconds)
setupGracefulShutdown(
  app,
  process.env.GRACE_CLOSE_DELAY ?? DEFAULT.GRACE_CLOSE_DELAY
)

// Start listening on the configured port.
app.listen({port: process.env.PORT ?? DEFAULT.PORT}, err => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})

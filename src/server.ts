/* eslint-disable n/no-process-exit */

import {config} from 'dotenv'
import Fastify, {FastifyLoggerOptions} from 'fastify'
import {PinoLoggerOptions} from 'fastify/types/logger.js'

import App from './app.js'
import {DEFAULT} from './shared/constants/defaults.constants.js'
import {setupGracefulShutdown} from './shared/utils/index.js'

config()

const loggerOptions: FastifyLoggerOptions & PinoLoggerOptions = {
  level: process.env.LOG_LEVEL ?? DEFAULT.LOG_LEVEL,
}

if (process.stdout.isTTY) {
  loggerOptions.transport = {
    target: 'pino-pretty',
  }
}

// Instantiate Fastify
const app = Fastify({
  pluginTimeout: process.env.PLUGIN_TIMEOUT ?? DEFAULT.PLUGIN_TIMEOUT,
  logger: {
    level: process.env.LOG_LEVEL ?? DEFAULT.LOG_LEVEL,
  },
})

// Register application
app.register(App)

// Set up graceful shutdown
setupGracefulShutdown(
  app,
  process.env.GRACE_CLOSE_DELAY ?? DEFAULT.GRACE_CLOSE_DELAY
)

// Start listening on the configured port.
app.listen(
  {
    port: process.env.PORT ?? DEFAULT.PORT,
    host: process.env.HOST ?? DEFAULT.HOST,
  },
  err => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
  }
)

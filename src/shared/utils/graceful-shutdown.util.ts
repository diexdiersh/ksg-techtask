/* eslint-disable n/no-process-exit */

import {FastifyInstance} from 'fastify'

import {
  NODE_ERROR_EVENTS,
  NODE_EXIT_EVENTS,
  NODE_SIGNAL_EVENTS,
} from '../constants/index.js'

type SignalEvent = (typeof NODE_SIGNAL_EVENTS)[number]
// type ErrorEvent = (typeof NODE_ERROR_EVENTS)[number]
// type ExitEvent = (typeof NODE_EXIT_EVENTS)[number]

interface ShutdownParams {
  signal?: SignalEvent
  err?: Error
  manual?: boolean
}

// Core function to handle graceful shutdown
export function setupGracefulShutdown(
  app: FastifyInstance,
  delay: number
): void {
  let isClosing = false

  // Clean up the event listeners once the shutdown begins
  function cleanup(): void {
    NODE_SIGNAL_EVENTS.forEach(event => process.removeListener(event, onSignal))
    NODE_ERROR_EVENTS.forEach(event => process.removeListener(event, onError))
    NODE_EXIT_EVENTS.forEach(event => process.removeListener(event, onExit))
  }

  // Handle signal events like SIGTERM or SIGINT
  function onSignal(signal: SignalEvent): void {
    handleShutdown({signal})
  }

  // Handle error events like uncaught exceptions or unhandled rejections
  function onError(err: Error): void {
    app.log.error('Error captured: ', err)
    handleShutdown({err})
  }

  // Handle normal exit events like beforeExit
  function onExit(): void {
    handleShutdown({})
  }

  // Core logic for handling graceful shutdown
  async function handleShutdown({signal}: ShutdownParams): Promise<void> {
    if (isClosing) return // Prevent multiple shutdown attempts
    isClosing = true

    app.log.info(`Received ${signal || 'exit event'}. Closing gracefully...`)

    cleanup() // Remove the listeners to avoid double-triggering shutdown

    try {
      // Set a force shutdown timeout to avoid hanging processes
      const forceShutdownTimeout = setTimeout(() => {
        app.log.warn('Forcing shutdown due to timeout.')
        process.exit(1) // Exit with error if graceful shutdown takes too long
      }, delay).unref()

      // Gracefully close the Fastify instance
      await app.close()

      // Clear the forced shutdown timeout if the app closes in time
      clearTimeout(forceShutdownTimeout)
      app.log.info('Closed all connections. Exiting...')
      process.exit(0) // Exit cleanly after successful shutdown
    } catch (shutdownError) {
      app.log.error('Error during shutdown:', shutdownError)
      process.exit(1) // Exit with error code if shutdown fails
    }
  }

  // Attach event listeners for shutdown events
  NODE_SIGNAL_EVENTS.forEach(event => process.once(event, onSignal))
  NODE_ERROR_EVENTS.forEach(event => process.once(event, onError))
  NODE_EXIT_EVENTS.forEach(event => process.once(event, onExit))
}

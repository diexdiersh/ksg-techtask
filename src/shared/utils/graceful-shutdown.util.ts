/* eslint-disable n/no-process-exit */

import {FastifyInstance} from 'fastify'

import {
  NODE_ERROR_EVENTS,
  NODE_EXIT_EVENTS,
  NODE_SIGNAL_EVENTS,
} from '../constants/index.js'

type SignalEvent = (typeof NODE_SIGNAL_EVENTS)[number]

interface ShutdownParams {
  signal?: SignalEvent
  err?: Error
  manual?: boolean
}

// Utility function to handle graceful shutdown
// It is simplified logic of close-with-grace package
export function setupGracefulShutdown(
  app: FastifyInstance,
  delay: number
): void {
  let isClosing = false

  function cleanup(): void {
    NODE_SIGNAL_EVENTS.forEach(event => process.removeListener(event, onSignal))
    NODE_ERROR_EVENTS.forEach(event => process.removeListener(event, onError))
    NODE_EXIT_EVENTS.forEach(event => process.removeListener(event, onExit))
  }

  // Handle signal events
  function onSignal(signal: SignalEvent): void {
    handleShutdown({signal})
  }

  // Handle error events
  function onError(err: Error): void {
    app.log.error('Error captured: ', err)
    handleShutdown({err})
  }

  // Handle normal exit
  function onExit(): void {
    handleShutdown({})
  }

  async function handleShutdown({signal}: ShutdownParams): Promise<void> {
    if (isClosing) return
    isClosing = true

    app.log.info(`Received ${signal || 'exit event'}. Closing gracefully...`)

    // Remove the listeners
    cleanup()

    try {
      const forceShutdownTimeout = setTimeout(() => {
        app.log.warn('Forcing shutdown due to timeout.')
        // Exit with error if graceful shutdown takes too long
        process.exit(1)
      }, delay).unref()

      // Close the Fastify instance
      await app.close()

      clearTimeout(forceShutdownTimeout)
      app.log.info('Closed all connections. Exiting...')
      // Exit cleanly after successful shutdown
      process.exit(0)
    } catch (shutdownError) {
      app.log.error('Error during shutdown:', shutdownError)
      // Exit with error code if shutdown fails
      process.exit(1)
    }
  }

  // Attach event listeners for shutdown events
  NODE_SIGNAL_EVENTS.forEach(event => process.once(event, onSignal))
  NODE_ERROR_EVENTS.forEach(event => process.once(event, onError))
  NODE_EXIT_EVENTS.forEach(event => process.once(event, onExit))
}

export const NODE_SIGNAL_EVENTS = [
  'SIGHUP',
  'SIGINT',
  'SIGQUIT',
  'SIGILL',
  'SIGTRAP',
  'SIGABRT',
  'SIGBUS',
  'SIGFPE',
  'SIGSEGV',
  'SIGUSR2',
  'SIGTERM',
] as const

export const NODE_ERROR_EVENTS = [
  'uncaughtException',
  'unhandledRejection',
] as const

export const NODE_EXIT_EVENTS = ['beforeExit'] as const

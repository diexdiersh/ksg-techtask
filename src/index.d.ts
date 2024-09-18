/* eslint-disable */

import {Env} from './shared/interfaces/env.interface.ts'

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Env
  }
}

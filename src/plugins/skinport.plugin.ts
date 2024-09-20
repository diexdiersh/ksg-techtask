import axios from 'axios'
import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fp from 'fastify-plugin'

import {SkinportApi} from '../shared/classes/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    skinport: SkinportApi
  }
}

async function skinport(
  fastify: FastifyInstance,
  _: FastifyPluginOptions
): Promise<void> {
  const axiosInstance = axios.create()

  const {SKINPORT_API_URL} = fastify.config

  const skinportApi = new SkinportApi(SKINPORT_API_URL, axiosInstance)

  fastify.decorate(skinport.name, skinportApi)
}

export default fp(skinport, {name: skinport.name})

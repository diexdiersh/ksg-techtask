// import axios, {AxiosInstance} from 'axios'
import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fp from 'fastify-plugin'

// import {Item} from '../shared/interfaces/index.js'
// import {SKINPORT_CURRENCIES} from '../shared/constants/index.js'

// type Currency = (typeof SKINPORT_CURRENCIES)[number]

// class Skinport {
//   constructor(
//     private readonly _url: string,
//     private readonly _axios: AxiosInstance
//   ) {}

//   async getItems(
//     appId: number,
//     tradable: boolean,
//     currency: Currency = 'EUR'
//   ): Promise<Item[]> {
//     return []

//     const url = new URL('/items', this._url)

//     this._axios.get(`${this._url}`, {
//       params: {app_id: appId, currency, tradable},
//     })
//   }
// }

async function skinport(
  _: FastifyInstance,
  __: FastifyPluginOptions
): Promise<void> {
  // const instance = axios({})
}

export default fp(skinport, {name: 'skinport'})

import {FastifyInstance, FastifyPluginOptions} from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import {ApiItem, QueryGetItems} from '../shared/interfaces/index.js'
import {Currency, ItemGroup} from '../shared/types/index.js'
import {paginate, sortByProperty} from '../shared/utils/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    items: ItemsService
  }
}

class ItemsService {
  constructor(private readonly _fastify: FastifyInstance) {}

  async getItems(query: QueryGetItems): Promise<ApiItem[]> {
    const {
      appId,
      currency,
      skip = 0,
      limit = 0,
      order = 'asc',
      sortBy = 'marketName',
    } = query

    this._fastify.log.info('Bootstrap server...')

    const appIds = Array.isArray(appId) ? appId : [appId]

    if (!appIds.length) {
      return []
    }

    this._fastify.log.debug(query, 'Items search parameters...')

    // Fetch from cache
    const cacheGroups = await this._fetchFromCache(appIds, currency)

    this._fastify.log.debug(`Found ${cacheGroups.length} cached group values`)

    const groups: ItemGroup[] = cacheGroups

    // Handle cache misses
    const missingGroups = this._getMissingGroups(appIds, cacheGroups)

    if (missingGroups.length > 0) {
      this._fastify.log.info(
        `Cache for ${missingGroups.length} groups not found! Loading items from API`
      )
      const apiGroups = await this._fetchFromApiAndCache(
        missingGroups,
        currency
      )
      groups.push(...apiGroups)
    }

    const itemsByUniqStr = this._aggregateItems(groups, currency)
    const items = Object.values(itemsByUniqStr)

    const sorted = sortByProperty(items, sortBy as keyof ApiItem, order)
    const paginatedItems = paginate(sorted, skip, limit)

    return paginatedItems
  }

  private _cacheKey(
    appId: number,
    currency: string,
    tradable: boolean
  ): string {
    return `items:${appId}:${currency}:${tradable}`
  }

  private async _fetchFromCache(
    appIds: number[],
    currency: string
  ): Promise<ItemGroup[]> {
    const getWait = appIds.map(appId => {
      const tradables = [true, false]
      return tradables
        .map(tradable =>
          this._fastify.redis
            .get(this._cacheKey(appId, currency, tradable))
            .then(cache => {
              if (cache) {
                return [appId, tradable, JSON.parse(cache)] as const
              }
              return undefined
            })
        )
        .flat()
    })

    return (await Promise.all(getWait.flat())).filter(
      v => v !== undefined
    ) as ItemGroup[]
  }

  private _getMissingGroups(
    appIds: number[],
    cacheGroups: ItemGroup[]
  ): Array<{appId: number; tradable: boolean}> {
    return appIds.flatMap(appId =>
      [true, false]
        .filter(
          tradable =>
            !cacheGroups.some(
              group => group[0] === appId && group[1] === tradable
            )
        )
        .map(tradable => ({appId, tradable}))
    )
  }

  private async _fetchFromApiAndCache(
    missingGroups: Array<{appId: number; tradable: boolean}>,
    currency: Currency
  ): Promise<ItemGroup[]> {
    const wait = missingGroups.map(({appId, tradable}) =>
      this._fastify.skinport
        .getItems({appId, currency, tradable})
        .then(items => {
          this._fastify.redis.set(
            this._cacheKey(appId, currency, tradable),
            JSON.stringify(items),
            'PX',
            this._fastify.config.SKINPORT_CACHE_TTL_MS
          )
          return [appId, tradable, items] as const
        })
    )

    return await Promise.all(wait)
  }

  private _aggregateItems(
    groups: ItemGroup[],
    currency: string
  ): Record<string, ApiItem> {
    return groups.reduce<Record<string, ApiItem>>((acc, curr) => {
      const [appId, tradable, items] = curr
      items.forEach(item => {
        const uniqStr = `${appId}:${item.market_hash_name}`
        const existedItem = acc[uniqStr] ?? {
          appId,
          currency,
          marketName: item.market_hash_name,
        }

        if (tradable) {
          existedItem.tradeMinPrice = item.min_price ?? 0
        } else {
          existedItem.minPrice = item.min_price ?? 0
        }

        acc[uniqStr] = existedItem
      })
      return acc
    }, {})
  }
}

async function items(
  fastify: FastifyInstance,
  _: FastifyPluginOptions
): Promise<void> {
  const itemsService = new ItemsService(fastify)
  fastify.decorate(items.name, itemsService)
}

export default fastifyPlugin(items, {
  name: items.name,
  dependencies: ['skinport'],
})
